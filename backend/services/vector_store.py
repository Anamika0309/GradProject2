import os
import chromadb
from chromadb.utils import embedding_functions

class VectorStore:
    def __init__(self, db_path: str = "./chroma_db"):
        self.db_path = db_path
        self.client = chromadb.PersistentClient(path=db_path)
        
        # Use default local sentence-transformers model
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
        
    def get_collection_name(self, run_id: str) -> str:
        # Chroma collection names must be alphanumeric and underscores, no hyphens
        return f"run_{run_id.replace('-', '_')}"

    def ingest_reviews(self, run_id: str, reviews_data: list[dict]):
        """
        reviews_data expects list of dicts:
        [
            {
                "id": "review-uuid",
                "content": "review text",
                "category": "Discovery", # optional metadata
                "sentiment": "negative"  # optional metadata
            }
        ]
        """
        if not reviews_data:
            return
            
        collection_name = self.get_collection_name(run_id)
        collection = self.client.get_or_create_collection(
            name=collection_name, 
            embedding_function=self.embedding_fn
        )
        
        ids = []
        documents = []
        metadatas = []
        
        for r in reviews_data:
            ids.append(r["id"])
            documents.append(r["content"])
            
            # Extract metadata, filter out None values
            meta = {
                "source": r.get("source", "unknown"),
                "is_discovery": r.get("is_discovery_related", True)
            }
            if r.get("category"): meta["category"] = r["category"]
            if r.get("sentiment"): meta["sentiment"] = r["sentiment"]
                
            metadatas.append(meta)
            
        # Batch insert to avoid rate limits / size limits, max 1000 per batch usually safe
        batch_size = 500
        for i in range(0, len(ids), batch_size):
            collection.add(
                ids=ids[i:i+batch_size],
                documents=documents[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size]
            )
            
        print(f"[{run_id}] Vectorized {len(ids)} reviews into ChromaDB.")

    def search_reviews(self, run_id: str, query: str, limit: int = 15) -> list[dict]:
        """
        Searches the vector database for a given query and returns top k results.
        """
        collection_name = self.get_collection_name(run_id)
        try:
            collection = self.client.get_collection(
                name=collection_name, 
                embedding_function=self.embedding_fn
            )
        except Exception as e:
            print(f"Collection not found for {run_id}: {e}")
            return []
            
        count = collection.count()
        if count == 0:
            return []
            
        actual_limit = min(limit, count)
            
        results = collection.query(
            query_texts=[query],
            n_results=actual_limit
        )
        
        if not results["documents"] or not results["documents"][0]:
            return []
            
        # Format the output
        docs = results["documents"][0]
        metas = results["metadatas"][0] if results["metadatas"] else [{}] * len(docs)
        
        out = []
        for d, m in zip(docs, metas):
            out.append({
                "content": d,
                "metadata": m
            })
            
        return out
