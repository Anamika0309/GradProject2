import uuid
from datetime import datetime
from database import SessionLocal
from models.db_models import Run, Review, Theme, Finding, Opportunity

def inject_demo_data():
    db = SessionLocal()
    
    # Create a Run
    run_id = str(uuid.uuid4())
    run = Run(
        id=run_id,
        status="complete",
        source_counts={"scraped": 200, "analyzed": 150, "discovery_related": 35},
        created_at=datetime.utcnow()
    )
    db.add(run)
    
    # Add Themes
    themes = [
        Theme(id=str(uuid.uuid4()), run_id=run_id, name="Category Navigation Friction", description="Users struggle to find non-grocery items.", root_cause="Sub-categories are hidden in the hamburger menu.", root_cause_label="Navigation UX", severity="High", review_count=12),
        Theme(id=str(uuid.uuid4()), run_id=run_id, name="Search Accuracy", description="Search bar fails for generic category queries.", root_cause="Search relies on exact product matching, not semantic categories.", root_cause_label="Search Engine", severity="High", review_count=9),
        Theme(id=str(uuid.uuid4()), run_id=run_id, name="Habitual Reordering", description="Users only buy their past purchases.", root_cause="Home page prioritizes 'Buy Again' too heavily over 'Discover'.", root_cause_label="UI Layout", severity="Medium", review_count=14)
    ]
    db.add_all(themes)
    
    # Add Findings
    findings = [
        Finding(id=str(uuid.uuid4()), run_id=run_id, question_id="q1", question_text="Why do users repeatedly buy from the same categories?", answer="Because the 'Buy Again' section occupies the entire first viewport of the home screen, creating a frictionless loop for past purchases but hiding new categories.", confidence=0.92, supporting_review_count=18, key_quotes=["I literally just open the app, click reorder, and close it.", "I didn't even know they sold electronics until my friend told me."]),
        Finding(id=str(uuid.uuid4()), run_id=run_id, question_id="q2", question_text="What prevents users from exploring new categories?", answer="Lack of contextual awareness and poor search for generic terms. Users expect exact product matches and don't browse.", confidence=0.88, supporting_review_count=14, key_quotes=["I tried searching for 'gifts' and got weird grocery items.", "It's too hard to browse without a specific item in mind."]),
        Finding(id=str(uuid.uuid4()), run_id=run_id, question_id="q3", question_text="How do users discover products today?", answer="Mostly through external word-of-mouth or social media, rather than in-app discovery features.", confidence=0.85, supporting_review_count=11, key_quotes=["Saw a reel about Blinkit delivering printouts.", "Only found out about beauty products from Reddit."]),
        Finding(id=str(uuid.uuid4()), run_id=run_id, question_id="q7", question_text="Which user segments are more likely to experiment?", answer="'Deal Hunters' and younger demographics are most likely to browse non-grocery categories when incentivized by cross-category coupons.", confidence=0.91, supporting_review_count=9, key_quotes=["Used a coupon that required me to add a beauty product.", "Always looking at the deals section for new stuff."])
    ]
    db.add_all(findings)
    
    # Add Opportunities
    opportunities = [
        Opportunity(id=str(uuid.uuid4()), run_id=run_id, title="Semantic Category Search", problem="Users can't find generic categories", user_need="I want to search for 'party supplies' instead of specific chips", product_opportunity="Implement LLM-based semantic routing for generic queries", business_impact="Increase discovery conversion by 15%", primary_segment="All", mention_rate=22.5, opportunity_score=9),
        Opportunity(id=str(uuid.uuid4()), run_id=run_id, title="Cross-category Bundling", problem="Users only buy groceries", user_need="I want to discover relevant items while buying my usuals", product_opportunity="Show 'Pairs well with' suggestions across categories at checkout", business_impact="Increase AOV and cross-category penetration", primary_segment="Habitual Buyers", mention_rate=18.0, opportunity_score=8)
    ]
    db.add_all(opportunities)
    
    db.commit()
    db.close()
    print(f"Successfully injected Demo Data Run: {run_id}")

if __name__ == "__main__":
    inject_demo_data()
