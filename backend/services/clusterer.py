import os
import json
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from openai import OpenAI

class ThemeClusterer:
    def __init__(self, n_clusters=8):
        self.n_clusters = n_clusters
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        if self.groq_api_key:
            self.client = OpenAI(api_key=self.groq_api_key, base_url="https://api.groq.com/openai/v1")
            self.model = "llama-3.1-8b-instant"
        elif self.api_key:
            self.client = OpenAI(api_key=self.api_key)
            self.model = "gpt-4o-mini"
        else:
            self.client = None

    def cluster_reviews(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes a list of reviews (must have 'id' and 'content'), clusters them,
        and generates theme names.
        Returns a list of Theme dictionaries.
        """
        if not reviews:
            return []
            
        texts = [r['content'] for r in reviews]
        
        # Determine actual number of clusters based on data size
        n_clusters = min(self.n_clusters, len(texts))
        if n_clusters == 0:
            return []

        # Generate embeddings
        embeddings = self.embedder.encode(texts)
        
        # Cluster
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(embeddings)
        labels = kmeans.labels_
        
        # Group reviews by cluster
        clusters = {}
        for idx, label in enumerate(labels):
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(texts[idx])
            
        themes = []
        for cluster_id, cluster_texts in clusters.items():
            # Sample up to 10 reviews for naming
            sample_size = min(10, len(cluster_texts))
            sample_texts = cluster_texts[:sample_size]
            
            theme_name, description = self._name_cluster(sample_texts)
            
            themes.append({
                "cluster_id": int(cluster_id),
                "name": theme_name,
                "description": description,
                "review_count": len(cluster_texts)
            })
            
        return themes

    def _name_cluster(self, sample_texts: List[str]) -> (str, str):
        if not self.client:
            print("WARNING: No OPENAI_API_KEY found. Mocking theme names.")
            return "Mock Theme Name", "A mock description of this cluster since API key is missing."
            
        prompt = "Review the following user feedback samples and identify the core underlying theme.\n\n"
        for i, t in enumerate(sample_texts):
            prompt += f"{i+1}. {t}\n"
            
        prompt += """
Generate a JSON object with two fields:
{
  "theme_name": "A short, 3-5 word name for this theme (e.g., 'Habitual Reordering Lock-in')",
  "description": "A 1-2 sentence description summarizing what users are talking about in this theme."
}
"""
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a product analytics assistant. Return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get("theme_name", "Unknown Theme"), result.get("description", "")
        except Exception as e:
            print(f"Error naming cluster: {e}")
            return "Error Theme", "Failed to generate theme name."
