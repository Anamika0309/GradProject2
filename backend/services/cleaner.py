import re
import hashlib

class ReviewCleaner:
    def __init__(self):
        # No heavy model loaded at init — keeps Railway startup fast and memory safe
        pass

    def clean(self, text: str) -> str:
        if not isinstance(text, str):
            return ""
        text = text.strip()
        text = re.sub(r'http\S+', '', text)          # Remove URLs
        text = re.sub(r'[^\w\s.,!?\'\"-]', '', text) # Remove special chars
        text = re.sub(r'\s+', ' ', text)              # Normalize whitespace
        return text.strip()

    def is_spam(self, text: str) -> bool:
        if not text or len(text.strip()) < 5:
            return True
        spam_patterns = [
            r'^\d+$',                  # only digits
        ]
        return any(re.search(p, text.lower()) for p in spam_patterns)

    def deduplicate(self, records: list[dict]) -> list[dict]:
        """
        Fast hash-based deduplication — O(n) time and memory.
        Removes exact-duplicate and near-duplicate reviews by normalising text
        before hashing (lowercase, collapse whitespace, strip punctuation).
        This is safe to run on 5000+ reviews without OOM on Railway free tier.
        """
        seen_hashes: set[str] = set()
        unique_records = []

        for r in records:
            text = r.get('raw_text', '')
            # Normalise: lowercase, strip punctuation, collapse spaces
            normalised = re.sub(r'[^\w\s]', '', text.lower())
            normalised = re.sub(r'\s+', ' ', normalised).strip()
            # Also create a shorter fingerprint (first 200 chars) to catch
            # reviews that are identical except for a trailing sentence
            fingerprint = normalised[:200]
            h = hashlib.md5(fingerprint.encode('utf-8')).hexdigest()
            if h not in seen_hashes:
                seen_hashes.add(h)
                unique_records.append(r)

        print(f"[cleaner] Dedup: {len(records)} → {len(unique_records)} unique reviews")
        return unique_records

    def tag_discovery(self, text: str) -> bool:
        keywords = [
            "new category", "never tried", "explore", "discover",
            "suggestion", "recommend", "first time", "didn't know",
            "found out", "came across", "stumbled", "reorder",
            "same products", "always buy", "habit", "routine"
        ]
        return any(kw in text.lower() for kw in keywords)
