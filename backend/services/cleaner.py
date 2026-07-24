import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class ReviewCleaner:
    def __init__(self):
        try:
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Error loading SentenceTransformer: {e}")
            self.model = None

    def clean(self, text: str) -> str:
        if not isinstance(text, str):
            return ""
        text = text.strip()
        text = re.sub(r'http\S+', '', text)         # Remove URLs
        text = re.sub(r'[^\w\s.,!?\'"-]', '', text) # Remove special chars
        text = re.sub(r'\s+', ' ', text)             # Normalize whitespace
        return text.strip()

    def is_spam(self, text: str) -> bool:
        if not text:
            return True
            
        spam_patterns = [
            r'^(great|good|bad|ok|nice|worst)\s*app?$',  # Too short
            r'^\d+$',                                      # Just numbers
            r'(.)\1{4,}',                                  # Repeated chars
        ]
        return any(re.search(p, text.lower()) for p in spam_patterns)

    def deduplicate(self, records: list[dict]) -> list[dict]:
        """
        records is a list of dicts containing 'raw_text'
        """
        if not self.model or not records:
            return records
            
        texts = [r['raw_text'] for r in records]
        embeddings = self.model.encode(texts)
        
        seen = []
        unique_records = []
        
        for i, emb in enumerate(embeddings):
            if not seen:
                seen.append(emb)
                unique_records.append(records[i])
                continue
                
            sims = cosine_similarity([emb], seen)[0]
            if max(sims) < 0.92:
                seen.append(emb)
                unique_records.append(records[i])
                
        return unique_records

    def tag_discovery(self, text: str) -> bool:
        keywords = [
            "new category", "never tried", "explore", "discover",
            "suggestion", "recommend", "first time", "didn't know",
            "found out", "came across", "stumbled", "reorder",
            "same products", "always buy", "habit", "routine"
        ]
        return any(kw in text.lower() for kw in keywords)
