import httpx
import asyncio
import time

async def main():
    base_url = "http://localhost:8000/api"
    
    print("Testing Run Creation...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(f"{base_url}/runs/create", json={
            "sources": ["play_store", "app_store"],
            "keyword_filter": "",
            "fetch_count": 50
        })
        
        if response.status_code != 200:
            print(f"Error creating run: {response.text}")
            return
            
        data = response.json()
        run_id = data.get("run_id")
        print(f"Run created with ID: {run_id}")
        
        # Poll for status
        while True:
            res = await client.get(f"{base_url}/runs/{run_id}/status")
            status_data = res.json()
            status = status_data.get("status")
            print(f"Status: {status} | Scraped: {status_data.get('total_scraped')} | Analyzed: {status_data.get('total_analyzed')} | Discovery Related: {status_data.get('discovery_related')}")
            
            if status in ["complete", "failed"]:
                break
                
            time.sleep(2)
            
if __name__ == "__main__":
    asyncio.run(main())
