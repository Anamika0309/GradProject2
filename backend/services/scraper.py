import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_play_store(
    app_id: str = "com.grofers.customerapp",
    count: int = 1500,
    keywords: list[str] | None = None
) -> list[dict]:
    import time
    try:
        from google_play_scraper import reviews, Sort
    except Exception as e:
        print(f"Play Store scraper not available: {e}")
        return []

    keywords = keywords or []
    # Fetch 2x the requested count to allow for filtering — safe on Railway free tier
    fetch_target = min(count * 2, 3000)
    print(f"Fetching up to {fetch_target} Play Store reviews (target: {count})...")
    try:
        result, _ = reviews(
            app_id,
            lang='en',
            country='in',
            sort=Sort.NEWEST,
            count=fetch_target
        )
    except Exception as e:
        print(f"Error fetching Play Store reviews: {e}")
        return []

    filtered = []
    for r in result:
        content_lower = r['content'].lower()
        if not keywords or any(kw in content_lower for kw in keywords):
            filtered.append({
                "source": "play_store",
                "raw_text": r['content'],
                "author": r['userName'],
                "date": r['at'],
                "rating": r['score'],
                "url": None
            })
            if len(filtered) >= count:
                break
    print(f"Play Store: fetched {len(filtered)} reviews")
    return filtered

def fetch_app_store(
    app_name: str = "blinkit",
    app_id: str = "1491249118",
    count: int = 1500
) -> list[dict]:
    print(f"Fetching up to {count} App Store reviews...")
    from app_store_scraper import AppStore
    app = AppStore(country='in', app_name=app_name, app_id=app_id)
    app.review(how_many=count)
    
    if not hasattr(app, 'reviews'):
        return []
        
    return [
        {
            "source": "app_store",
            "raw_text": r['review'],
            "author": r.get('userName'),
            "date": r.get('date'),
            "rating": r.get('rating'),
            "url": None
        }
        for r in app.reviews
    ]

def fetch_reddit(
    subreddits: list[str] = ["blinkit", "india", "bangalore", "mumbai", "quickcommerce"],
    keywords: list[str] | None = None,
    limit: int = 1500
) -> list[dict]:
    import time
    try:
        import praw

        reddit = praw.Reddit(
            client_id=os.environ.get("REDDIT_CLIENT_ID"),
            client_secret=os.environ.get("REDDIT_CLIENT_SECRET"),
            user_agent=os.environ.get("REDDIT_USER_AGENT", "blinkit_research_bot/1.0")
        )

        posts = []
        kws = keywords or []
        query = " OR ".join(kws) if kws else "blinkit"
        for sub in subreddits:
            try:
                print(f"Searching subreddit {sub}...")
                for submission in reddit.subreddit(sub).search(query, limit=limit, sort="new"):
                    posts.append({
                        "source": f"reddit__{sub}",
                        "raw_text": f"{submission.title}\n{submission.selftext}",
                        "author": str(submission.author) if submission.author else "Unknown",
                        "date": pd.to_datetime(submission.created_utc, unit='s'),
                        "rating": None,
                        "url": submission.url
                    })
                time.sleep(1) # delay to respect rate limits
            except Exception as e:
                print(f"Error scraping subreddit {sub}: {e}")
        return posts
    except Exception as e:
        print(f"Error setting up Reddit scraper: {e}")
        return []

def process_csv_upload(file_path: str) -> list[dict]:
    try:
        df = pd.read_csv(file_path)
        if 'text' not in df.columns:
            raise ValueError("CSV must contain a 'text' column")
            
        records = []
        for _, row in df.iterrows():
            records.append({
                "source": row.get('source', 'csv'),
                "raw_text": row['text'],
                "author": row.get('author'),
                "date": pd.to_datetime(row['date']) if 'date' in df.columns and pd.notna(row['date']) else None,
                "rating": row.get('rating'),
                "url": row.get('url')
            })
        return records
    except Exception as e:
        print(f"Error processing CSV: {e}")
        return []
