import pandas as pd
import praw
from google_play_scraper import reviews, Sort
from app_store_scraper import AppStore
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_play_store(
    app_id: str = "com.grofers.customerapp",
    count: int = 1000,
    keywords: list[str] = ["new category", "explore", "reorder", "discover", "suggest", "never tried"]
) -> list[dict]:
    import time
    print(f"Fetching up to {count * 10} Play Store reviews to filter...")
    result, _ = reviews(
        app_id,
        lang='en',
        country='in',
        sort=Sort.NEWEST,
        count=count * 10  # fetch more because we will filter heavily
    )
    
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
    return filtered

def fetch_app_store(
    app_name: str = "blinkit",
    app_id: str = "1491249118",
    count: int = 1000
) -> list[dict]:
    print(f"Fetching up to {count} App Store reviews...")
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
    keywords: list[str] = ["blinkit", "quick commerce", "grofers"],
    limit: int = 500
) -> list[dict]:
    import time
    try:
        reddit = praw.Reddit(
            client_id=os.environ.get("REDDIT_CLIENT_ID"),
            client_secret=os.environ.get("REDDIT_CLIENT_SECRET"),
            user_agent=os.environ.get("REDDIT_USER_AGENT", "blinkit_research_bot/1.0")
        )
        
        posts = []
        for sub in subreddits:
            try:
                print(f"Searching subreddit {sub}...")
                for submission in reddit.subreddit(sub).search(" OR ".join(keywords), limit=limit, sort="new"):
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
