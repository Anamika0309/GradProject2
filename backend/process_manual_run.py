import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import SessionLocal
from models.db_models import Run, Review, ClassifiedReview, Theme, Finding, Opportunity
from services.classifier import ReviewClassifier
from services.clusterer import ThemeClusterer
from services.analyzer import RootCauseAnalyzer
from services.insight_gen import InsightGenerator
from services.opportunity import OpportunityGenerator
from services.vector_store import VectorStore

def process_manual_run():
    db = SessionLocal()
    
    try:
        # Find the manual run (it was just inserted, so it's the latest)
        runs = db.query(Run).order_by(Run.created_at.desc()).all()
        target_run = None
        for r in runs:
            # The manual run has 'analyzed' > 0 and 'scraped' > 0 but no classified reviews yet
            # Or just take the very first one since we literally just inserted it
            target_run = r
            break
                
        if not target_run:
            print("Manual run not found in the database. Did you run insert_manual_reviews.py?")
            return
            
        run_id = target_run.id
        print(f"Found manual run: {run_id}")
        
        # Check if already processed
        existing_classified = db.query(ClassifiedReview).filter(ClassifiedReview.run_id == run_id).count()
        if existing_classified > 0:
            print("This run was already processed through the AI pipeline.")
        
        reviews = db.query(Review).filter(Review.run_id == run_id).all()
        discovery_reviews = [r for r in reviews if r.is_discovery_related]
        
        print(f"Processing {len(discovery_reviews)} discovery reviews...")
        
        if existing_classified == 0:
            classifier = ReviewClassifier()
            reviews_for_classification = [{"id": r.id, "content": r.content} for r in discovery_reviews]
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
            print("Classified reviews saved.")
            
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
            print("Themes saved.")
            
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
            print("Findings saved.")
            
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
            print("Opportunities saved.")
        else:
            classified = [{"review_id": c.review_id, "category": c.category, "sentiment": c.sentiment} for c in db.query(ClassifiedReview).filter(ClassifiedReview.run_id == run_id).all()]
            
        print("Vectorizing into ChromaDB...")
        try:
            vs = VectorStore()
            cls_map = {c['review_id']: c for c in classified}
            vector_payload = []
            for r in discovery_reviews:
                meta = cls_map.get(r.id, {})
                vector_payload.append({
                    "id": r.id,
                    "content": r.content,
                    "category": meta.get('category'),
                    "sentiment": meta.get('sentiment')
                })
            vs.ingest_reviews(run_id, vector_payload)
            print("Vectorization complete.")
        except Exception as e:
            print(f"Error vectorizing: {e}")
            
    finally:
        db.close()

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    process_manual_run()
