from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Run(Base):
    __tablename__ = "runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="pending")
    source_counts = Column(JSON, default=dict)

    reviews = relationship("Review", back_populates="run", cascade="all, delete-orphan")
    classified_reviews = relationship("ClassifiedReview", back_populates="run", cascade="all, delete-orphan")
    themes = relationship("Theme", back_populates="run", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="run", cascade="all, delete-orphan")
    opportunities = relationship("Opportunity", back_populates="run", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("runs.id"))
    source = Column(String, nullable=False)
    author = Column(String)
    rating = Column(Integer, nullable=True)
    content = Column(Text, nullable=False)
    review_date = Column(DateTime, nullable=True)
    is_discovery_related = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    run = relationship("Run", back_populates="reviews")

class ClassifiedReview(Base):
    __tablename__ = "classified_reviews"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("runs.id"))
    review_id = Column(String, ForeignKey("reviews.id"))
    category = Column(String)
    sentiment = Column(String)
    user_segment = Column(String)
    barrier = Column(String)
    confidence = Column(Float)
    
    run = relationship("Run", back_populates="classified_reviews")

class Theme(Base):
    __tablename__ = "themes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("runs.id"))
    cluster_id = Column(Integer)
    name = Column(String)
    description = Column(Text)
    root_cause = Column(Text)
    root_cause_label = Column(String)
    severity = Column(String)
    review_count = Column(Integer)
    
    run = relationship("Run", back_populates="themes")

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("runs.id"))
    question_id = Column(String) # e.g. "Q1"
    question_text = Column(String)
    answer = Column(Text)
    confidence = Column(Float)
    supporting_review_count = Column(Integer)
    key_quotes = Column(JSON) # list of strings
    segment_breakdown = Column(JSON) # dict
    methodology_note = Column(String)
    
    run = relationship("Run", back_populates="findings")

class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("runs.id"))
    title = Column(String)
    problem = Column(Text)
    user_need = Column(String)
    product_opportunity = Column(Text)
    business_impact = Column(String)
    primary_segment = Column(String)
    mention_rate = Column(String)
    opportunity_score = Column(Integer)
    representative_quote = Column(Text)
    
    run = relationship("Run", back_populates="opportunities")
