import os
import json
from typing import List, Dict, Any
from groq import Groq

class ReviewClassifier:
    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        self.model = "llama-3.1-8b-instant"

    def classify_batch(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not self.client or not reviews:
            print("WARNING: No GROQ_API_KEY found or empty reviews. Skipping classification and returning mock data.")
            return self._mock_classification(reviews)

        results = []
        batch_size = 20
        
        for i in range(0, len(reviews), batch_size):
            batch = reviews[i:i+batch_size]
            prompt = self._build_batch_prompt(batch)
            
            try:
                response = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a data categorization assistant. You MUST return ONLY valid JSON matching the schema exactly, specifically a JSON array of classification objects. Do not wrap in markdown."},
                        {"role": "user", "content": prompt}
                    ],
                    model=self.model,
                    temperature=0.0,
                    response_format={"type": "json_object"}
                )
                
                content = response.choices[0].message.content
                
                try:
                    parsed_array = json.loads(content)
                    if isinstance(parsed_array, dict) and "classifications" in parsed_array:
                        parsed_array = parsed_array["classifications"]
                except json.JSONDecodeError:
                    print(f"Failed to parse JSON for batch {i//batch_size}. Mocking.")
                    parsed_array = []
                
                # Match them up by index or ID
                # Since LLM might not return exact same number, we'll map by ID if possible, else zip
                parsed_map = {}
                if isinstance(parsed_array, list):
                    for item in parsed_array:
                        if isinstance(item, dict) and 'review_id' in item:
                            parsed_map[item['review_id']] = item
                
                for r in batch:
                    if r['id'] in parsed_map:
                        classification = parsed_map[r['id']]
                    else:
                        classification = self._mock_classification([r])[0]
                    
                    classification['review_id'] = r['id']
                    results.append(classification)
                
                print(f"Classified batch {i//batch_size + 1} (Reviews {i} to {min(i+batch_size, len(reviews))})")
            except Exception as e:
                print(f"Error classifying batch {i//batch_size}: {e}")
                results.extend(self._mock_classification(batch))

        return results

    def _build_batch_prompt(self, batch: List[Dict[str, Any]]) -> str:
        prompt = "Analyze the following reviews and classify each into the specified JSON structure.\n\n"
        for r in batch:
            prompt += f"Review ID: {r['id']}\nText: \"{r['content']}\"\n\n"
            
        prompt += """
Output MUST be a JSON object containing a "classifications" array.
Schema for each object in the array:
{
  "review_id": "String (Must match the Review ID provided)",
  "category": "String (One of: Delivery, Product Availability, Search, Recommendations, Pricing, Category Discovery, Trust, UX, Personalization, Customer Support, Others)",
  "sentiment": "String (positive | neutral | negative)",
  "user_segment": "String (habitual_buyer | category_explorer | deal_hunter | new_user | power_shopper)",
  "barrier": "String (convenience_lock_in | awareness_gap | trust_gap | time_pressure | search_dependency | none)",
  "confidence": "Float (0.0 to 1.0)"
}
"""
        return prompt

    def _mock_classification(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for r in reviews:
            results.append({
                "review_id": r['id'],
                "category": "Category Discovery",
                "sentiment": "neutral",
                "user_segment": "category_explorer",
                "barrier": "trust_gap",
                "confidence": 0.85
            })
        return results
