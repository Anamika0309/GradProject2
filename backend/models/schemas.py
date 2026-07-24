from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RunCreate(BaseModel):
    sources: List[str]
    keyword_filter: str
    fetch_count: int

class RunStatus(BaseModel):
    run_id: str
    status: str
    total_scraped: Optional[int] = 0
    total_analyzed: Optional[int] = 0
    discovery_related: Optional[int] = 0

class ReviewModel(BaseModel):
    id: str
    run_id: str
    source: str
    raw_text: str
    author: Optional[str]
    date: Optional[datetime]
    rating: Optional[int]
    url: Optional[str]
    is_discovery_related: bool = False
