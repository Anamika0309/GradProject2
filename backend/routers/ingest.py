from fastapi import APIRouter, BackgroundTasks, UploadFile, File, Depends
import uuid
from typing import List
from sqlalchemy.orm import Session
from models.schemas import RunCreate, RunStatus
from models.db_models import Run, Review, ClassifiedReview, Theme, Finding, Opportunity
from database import get_db, SessionLocal
from services.scraper import fetch_play_store, fetch_app_store, fetch_reddit, process_csv_upload
from services.cleaner import ReviewCleaner
from services.classifier import ReviewClassifier
from services.clusterer import ThemeClusterer
from services.analyzer import RootCauseAnalyzer
from services.insight_gen import InsightGenerator
from services.opportunity import OpportunityGenerator
from services.vector_store import VectorStore
from datetime import datetime, timezone

router = APIRouter()

def run_pipeline(run_id: str, sources: List[str], keyword_filter: str, fetch_count: int):
    # Use a new DB session for the background task
    db = SessionLocal()
    try:
        run_record = db.query(Run).filter(Run.id == run_id).first()
        if not run_record:
            return
            
        run_record.status = "fetching"
        db.commit()
        
        keywords = [k.strip() for k in keyword_filter.split(",")] if keyword_filter else []
        all_records = []
        
        if "play_store" in sources:
            print(f"[{run_id}] Fetching Play Store...")
            records = fetch_play_store(count=fetch_count, keywords=keywords)
            all_records.extend(records)
            
        if "app_store" in sources:
            print(f"[{run_id}] Fetching App Store...")
            records = fetch_app_store(count=fetch_count)
            all_records.extend(records)
            
        if "reddit" in sources:
            print(f"[{run_id}] Fetching Reddit...")
            records = fetch_reddit(limit=fetch_count, keywords=keywords)
            all_records.extend(records)
            
        run_record.source_counts = {"scraped": len(all_records)}
        run_record.status = "cleaning"
        db.commit()
        print(f"[{run_id}] Total scraped: {len(all_records)}")
        
        cleaner = ReviewCleaner()
        
        for r in all_records:
            r['raw_text'] = cleaner.clean(r['raw_text'])
            
        non_spam = [r for r in all_records if not cleaner.is_spam(r['raw_text'])]
        unique_records = cleaner.deduplicate(non_spam)
        
        discovery_count = 0
        db_reviews = []
        
        # Save Raw Reviews
        for r in unique_records:
            is_discovery = cleaner.tag_discovery(r['raw_text'])
            if is_discovery:
                discovery_count += 1
                
            review_obj = Review(
                id=str(uuid.uuid4()),
                run_id=run_id,
                source=r['source'],
                author=r.get('author'),
                rating=r.get('rating'),
                content=r['raw_text'],
                review_date=r.get('date'),
                is_discovery_related=is_discovery
            )
            db_reviews.append(review_obj)
            # Inject id back to dict for later pipeline steps
            r['id'] = review_obj.id
            
        db.bulk_save_objects(db_reviews)
        db.commit()

        # Update stats
        run_record.source_counts = {
            "scraped": len(all_records),
            "analyzed": len(unique_records),
            "discovery_related": discovery_count
        }
        
        # Phase 3: AI Pipeline
        run_record.status = "classifying"
        db.commit()
        print(f"[{run_id}] Running classification...")
        
        classifier = ReviewClassifier()
        # For cost/time reasons, only classify discovery related reviews in test
        discovery_reviews = [r for r in unique_records if cleaner.tag_discovery(r['raw_text'])]
        # Convert dict to match expected schema
        reviews_for_classification = [{"id": r["id"], "content": r["raw_text"]} for r in discovery_reviews]
        
        classified = classifier.classify_batch(reviews_for_classification)
        
        db_classified = []
        for c in classified:
            db_classified.append(ClassifiedReview(
                run_id=run_id,
                review_id=c['review_id'],
                category=c.get('category'),
                sentiment=c.get('sentiment'),
                user_segment=c.get('user_segment'),
                barrier=c.get('barrier'),
                confidence=c.get('confidence')
            ))
        db.bulk_save_objects(db_classified)
        db.commit()

        run_record.status = "clustering"
        db.commit()
        print(f"[{run_id}] Clustering themes...")
        
        clusterer = ThemeClusterer()
        clusters = clusterer.cluster_reviews(reviews_for_classification)
        
        analyzer = RootCauseAnalyzer()
        themes = analyzer.analyze_themes(clusters)
        
        db_themes = []
        for t in themes:
            db_themes.append(Theme(
                run_id=run_id,
                cluster_id=t['cluster_id'],
                name=t['name'],
                description=t['description'],
                root_cause=t.get('root_cause'),
                root_cause_label=t.get('root_cause_label'),
                severity=t.get('severity'),
                review_count=t.get('review_count')
            ))
        db.bulk_save_objects(db_themes)
        db.commit()

        run_record.status = "generating insights"
        db.commit()
        print(f"[{run_id}] Generating insights...")
        
        insight_gen = InsightGenerator()
        findings = insight_gen.generate_findings(classified, themes)
        
        db_findings = []
        for f in findings:
            db_findings.append(Finding(
                run_id=run_id,
                question_id=f['question_id'],
                question_text=f['question_text'],
                answer=f['answer'],
                confidence=f.get('confidence'),
                supporting_review_count=f.get('supporting_review_count'),
                key_quotes=f.get('key_quotes', []),
                segment_breakdown=f.get('segment_breakdown', {}),
                methodology_note=f.get('methodology_note')
            ))
        db.bulk_save_objects(db_findings)
        db.commit()

        run_record.status = "scoring opportunities"
        db.commit()
        print(f"[{run_id}] Scoring opportunities...")
        
        opp_gen = OpportunityGenerator()
        opportunities = opp_gen.generate_opportunities(findings)
        
        db_opportunities = []
        for o in opportunities:
            db_opportunities.append(Opportunity(
                run_id=run_id,
                title=o.get('title'),
                problem=o.get('problem'),
                user_need=o.get('user_need'),
                product_opportunity=o.get('product_opportunity'),
                business_impact=o.get('business_impact'),
                primary_segment=o.get('primary_segment'),
                mention_rate=o.get('mention_rate'),
                opportunity_score=o.get('opportunity_score'),
                representative_quote=o.get('representative_quote')
            ))
        db.bulk_save_objects(db_opportunities)
        db.commit()

        run_record.status = "vectorizing"
        db.commit()
        print(f"[{run_id}] Vectorizing into ChromaDB...")
        
        try:
            vs = VectorStore()
            # Merge text into classified
            cls_map = {c['review_id']: c for c in classified}
            vector_payload = []
            for r in discovery_reviews:
                meta = cls_map.get(r['id'], {})
                vector_payload.append({
                    "id": r['id'],
                    "content": r['raw_text'],
                    "category": meta.get('category'),
                    "sentiment": meta.get('sentiment')
                })
            vs.ingest_reviews(run_id, vector_payload)
        except Exception as e:
            print(f"[{run_id}] Error vectorizing: {e}")

        run_record.status = "complete"
        db.commit()
        print(f"[{run_id}] Pipeline complete.")
    except Exception as e:
        print(f"[{run_id}] Error in pipeline: {e}")
        if run_record:
            run_record.status = "error"
            db.commit()
    finally:
        db.close()

@router.post("/runs/create", response_model=dict)
async def create_run(run_data: RunCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    run_id = str(uuid.uuid4())
    
    new_run = Run(
        id=run_id,
        status="pending",
        source_counts={"scraped": 0, "analyzed": 0, "discovery_related": 0}
    )
    db.add(new_run)
    db.commit()
    
    background_tasks.add_task(
        run_pipeline, 
        run_id, 
        run_data.sources, 
        run_data.keyword_filter, 
        run_data.fetch_count
    )
    return {"run_id": run_id, "status": "processing"}

@router.get("/runs/{run_id}/status", response_model=RunStatus)
async def get_run_status(run_id: str, db: Session = Depends(get_db)):
    run_record = db.query(Run).filter(Run.id == run_id).first()
    if run_record:
        counts = run_record.source_counts or {}
        return RunStatus(
            run_id=run_id, 
            status=run_record.status,
            total_scraped=counts.get("scraped", 0),
            total_analyzed=counts.get("analyzed", 0),
            discovery_related=counts.get("discovery_related", 0)
        )
    return RunStatus(run_id=run_id, status="not_found")

@router.get("/runs")
async def get_all_runs(db: Session = Depends(get_db)):
    runs = db.query(Run).order_by(Run.created_at.desc()).all()
    return [{"id": r.id, "created_at": r.created_at, "status": r.status, "source_counts": r.source_counts} for r in runs]

@router.get("/runs/{run_id}")
async def get_run_details(run_id: str, db: Session = Depends(get_db)):
    run_record = db.query(Run).filter(Run.id == run_id).first()
    if not run_record:
        return {"error": "Run not found"}
        
    themes = db.query(Theme).filter(Theme.run_id == run_id).all()
    findings = db.query(Finding).filter(Finding.run_id == run_id).all()
    opportunities = db.query(Opportunity).filter(Opportunity.run_id == run_id).all()
    
    # Compute summary metrics
    classified_reviews = db.query(ClassifiedReview).filter(ClassifiedReview.run_id == run_id).all()
    total_classified = len(classified_reviews)
    
    negative_reviews = sum(1 for cr in classified_reviews if cr.sentiment == "negative")
    positive_reviews = sum(1 for cr in classified_reviews if cr.sentiment == "positive")
    
    exploration_rate = 0
    if total_classified > 0:
        explorer_reviews = sum(1 for cr in classified_reviews if cr.user_segment == "category_explorer" or cr.category == "Category Discovery")
        exploration_rate = round((explorer_reviews / total_classified) * 100, 1)
        
    return {
        "id": run_record.id,
        "created_at": run_record.created_at,
        "status": run_record.status,
        "source_counts": run_record.source_counts,
        "metrics": {
            "exploration_rate": exploration_rate,
            "negative_reviews": negative_reviews,
            "positive_reviews": positive_reviews
        },
        "themes": [{"id": t.id, "name": t.name, "description": t.description, "root_cause": t.root_cause, "root_cause_label": t.root_cause_label, "severity": t.severity, "review_count": t.review_count} for t in themes],
        "findings": [{"id": f.id, "question_id": f.question_id, "question_text": f.question_text, "answer": f.answer, "confidence": f.confidence, "supporting_review_count": f.supporting_review_count, "key_quotes": f.key_quotes, "segment_breakdown": f.segment_breakdown} for f in findings],
        "opportunities": [{"id": o.id, "title": o.title, "problem": o.problem, "product_opportunity": o.product_opportunity, "business_impact": o.business_impact, "opportunity_score": o.opportunity_score} for o in opportunities]
    }

from pydantic import BaseModel
import os
from openai import OpenAI

class ChatRequest(BaseModel):
    question: str
    conversation_history: List[dict] = []

@router.post("/runs/{run_id}/chat")
async def chat_with_run(run_id: str, req: ChatRequest, db: Session = Depends(get_db)):
    run_record = db.query(Run).filter(Run.id == run_id).first()
    if not run_record:
        return {"error": "Run not found"}

    counts = run_record.source_counts or {}
    total_reviews = counts.get("analyzed", counts.get("scraped", 0))
    discovery_count = counts.get("discovery_related", 0)

    themes = db.query(Theme).filter(Theme.run_id == run_id).all()
    all_findings = db.query(Finding).filter(Finding.run_id == run_id).all()
    opportunities = db.query(Opportunity).filter(Opportunity.run_id == run_id).all()

    MOCKED_ANSWERS = {"Mocked answer for testing.", "mocked answer for testing"}
    MOCKED_THEME_NAMES = {"Error Theme", "Mock Theme Name", "Failed to generate theme name."}

    # Filter out mocked/error themes
    real_themes = [
        t for t in themes
        if t.name and t.name not in MOCKED_THEME_NAMES
        and t.description and "mock" not in t.description.lower()
        and "failed to generate" not in (t.name or "").lower()
    ]

    # Filter out mocked findings
    real_findings = [
        f for f in all_findings
        if f.answer and f.answer.strip() not in MOCKED_ANSWERS
        and "mocked" not in f.answer.lower()
        and len(f.answer.strip()) > 30
    ]

    # Build structured context
    context = f"BLINKIT USER RESEARCH CORPUS — {total_reviews} total reviews, {discovery_count} discovery-related\n\n"

    if real_themes:
        context += "=== IDENTIFIED THEMES ===\n"
        for t in real_themes:
            context += f"• {t.name}: {t.description}"
            if t.root_cause:
                context += f"\n  Root Cause: {t.root_cause}"
            context += "\n"
        context += "\n"

    if real_findings:
        context += "=== RESEARCH FINDINGS ===\n"
        for f in real_findings:
            context += f"Q: {f.question_text}\nA: {f.answer}\n\n"

    real_opps = [o for o in opportunities if o.title and o.product_opportunity]
    if real_opps:
        context += "=== PRODUCT OPPORTUNITIES ===\n"
        for o in real_opps:
            score = f"{o.opportunity_score}/10" if o.opportunity_score else "N/A"
            context += f"• {o.title} (Score {score}): {o.product_opportunity}\n"
        context += "\n"

    # --- Retrieve review evidence ---
    rag_results = []
    try:
        vs = VectorStore()
        rag_results = vs.search_reviews(run_id, req.question, limit=25)
    except Exception as e:
        print(f"Vector search failed: {e}")

    # Fallback: pull real reviews from SQLite when vector store is empty
    if not rag_results:
        print(f"[chat] Vector store empty for {run_id}, using SQLite reviews as fallback.")
        discovery_reviews = db.query(Review).filter(
            Review.run_id == run_id,
            Review.is_discovery_related == True
        ).limit(200).all()

        if not discovery_reviews:
            # Last resort: any reviews for this run
            discovery_reviews = db.query(Review).filter(
                Review.run_id == run_id
            ).limit(200).all()

        classified_rows = db.query(ClassifiedReview).filter(
            ClassifiedReview.run_id == run_id
        ).all()
        cls_map = {c.review_id: c for c in classified_rows}

        for r in discovery_reviews:
            meta = cls_map.get(r.id)
            rag_results.append({
                "content": r.content,
                "metadata": {
                    "sentiment": meta.sentiment if meta else "unknown",
                    "category": meta.category if meta else "unknown",
                }
            })

    if rag_results:
        context += f"=== USER REVIEW EVIDENCE ({len(rag_results)} reviews) ===\n"
        for i, res in enumerate(rag_results[:60]):
            sentiment = res["metadata"].get("sentiment", "unknown")
            category = res["metadata"].get("category", "")
            label = sentiment
            if category and category not in ("unknown", None):
                label += f", {category}"
            content = res.get("content", "").strip()
            if content:
                context += f"[{i+1}] ({label}): {content}\n"
        context += "\n"

    system_prompt = f"""You are the Blinkit Discovery Insight Assistant — an expert AI product manager and UX researcher specialising in quick-commerce apps.

You have been given a corpus of real Blinkit user reviews and research findings.
Your task is to answer questions by synthesising evidence from this corpus.

GUIDELINES:
1. Always ground your answer in the review evidence or themes provided.
2. Quote or paraphrase specific reviews (use [N] numbering) to support your points.
3. Organise your answer with clear headings or bullet points.
4. If the evidence is limited on a topic, acknowledge that but still provide the best synthesis possible.
5. NEVER refuse to answer because of a policy or because the answer is "not in the context" if relevant reviews exist.

{context}"""

    api_key = os.environ.get("OPENAI_API_KEY")
    groq_api_key = os.environ.get("GROQ_API_KEY")

    if groq_api_key:
        client = OpenAI(api_key=groq_api_key, base_url="https://api.groq.com/openai/v1")
        model = "llama-3.3-70b-versatile"
    elif api_key:
        client = OpenAI(api_key=api_key)
        model = "gpt-4o"
    else:
        return {"answer": "⚠️ No API key configured. Please set GROQ_API_KEY or OPENAI_API_KEY in the backend .env file."}

    messages = [{"role": "system", "content": system_prompt}]
    for msg in req.conversation_history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    messages.append({"role": "user", "content": req.question})

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.4,
            max_tokens=1200,
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        print(f"Chat LLM error: {e}")
        return {"answer": f"⚠️ Error generating answer: {str(e)}"}

@router.get("/runs/{run_id}/reviews")
async def get_run_reviews(run_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.run_id == run_id).all()
    classified = db.query(ClassifiedReview).filter(ClassifiedReview.run_id == run_id).all()
    c_map = {c.review_id: c for c in classified}
    
    result = []
    for r in reviews:
        meta = c_map.get(r.id)
        # Handle datetime serialization
        date_str = r.review_date.strftime("%b %Y") if r.review_date else r.created_at.strftime("%b %Y")
        
        # Human readable source mapping
        source_map = {
            "play_store": "Play Store",
            "app_store": "App Store",
            "reddit": "Reddit",
            "community_forum": "Community Forums",
            "social_media": "Social Media"
        }
        
        result.append({
            "id": r.id,
            "source": source_map.get(r.source, r.source.capitalize()),
            "sentiment": meta.sentiment if meta and meta.sentiment else "neutral",
            "theme": meta.category if meta and meta.category else "General",
            "date": date_str,
            "text": r.content
        })
    return result
