import os
import json
from typing import Dict, Any, List
from openai import OpenAI

class InsightGenerator:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        if self.groq_api_key:
            self.client = OpenAI(api_key=self.groq_api_key, base_url="https://api.groq.com/openai/v1")
            self.model = "llama-3.1-8b-instant"
        elif self.api_key:
            self.client = OpenAI(api_key=self.api_key)
            self.model = "gpt-4o"
        else:
            self.client = None
        
        self.questions = [
            {"id": "Q1", "text": "Why do users repeatedly buy from the same categories?"},
            {"id": "Q2", "text": "What prevents users from exploring new categories?"},
            {"id": "Q3", "text": "How do users discover products today?"},
            {"id": "Q4", "text": "What role do habits play in shopping behavior?"},
            {"id": "Q5", "text": "What information do users need before trying a new category?"},
            {"id": "Q6", "text": "What frustrations emerge repeatedly?"},
            {"id": "Q7", "text": "Which user segments are more likely to experiment?"},
            {"id": "Q8", "text": "What unmet needs emerge consistently across discussions?"}
        ]

    def generate_findings(self, classified_reviews: List[Dict[str, Any]], themes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generates Executive Findings (Q1-Q8) based on reviews and themes.
        """
        if not self.client:
            print("WARNING: No OPENAI_API_KEY. Mocking findings.")
            return self._mock_findings()
            
        # Summarize data to fit context window
        theme_summary = "\\n".join([f"- {t['name']}: {t['description']} (Root Cause: {t.get('root_cause_label', '')})" for t in themes])
        
        findings = []
        for q in self.questions:
            prompt = f"""
You are an expert Growth Product Manager. Answer the following research question based ONLY on the provided themes and context.

Question: {q['text']}

Available Context Themes:
{theme_summary}

Total Reviews Analyzed: {len(classified_reviews)}

Generate a JSON object with:
{{
  "answer": "A 2-3 paragraph analytical answer.",
  "confidence": "Float (0.0 to 1.0) indicating how strongly the data supports this",
  "key_quotes": ["Quote 1", "Quote 2", "Quote 3"] (Generate plausible synthesized quotes reflecting the themes if verbatim aren't available),
  "segment_breakdown": {{"habitual_buyer": 5, "category_explorer": 2}},
  "methodology_note": "A short note about how this was derived."
}}
"""
            try:
                response = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a product analytics engine. Return valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    model=self.model,
                    temperature=0.5,
                    response_format={"type": "json_object"}
                )
                
                result = json.loads(response.choices[0].message.content)
                result['question_id'] = q['id']
                result['question_text'] = q['text']
                # Default empty segment breakdown if not a dict
                if not isinstance(result.get('segment_breakdown'), dict):
                    result['segment_breakdown'] = {}
                    
                findings.append(result)
            except Exception as e:
                print(f"Error generating finding for {q['id']}: {e}")
                
        return findings

    def _mock_findings(self):
        return [
            {
                "question_id": q["id"],
                "question_text": q["text"],
                "answer": "Mocked answer for testing.",
                "confidence": 0.9,
                "supporting_review_count": 10,
                "key_quotes": ["Mock quote 1"],
                "segment_breakdown": {},
                "methodology_note": "Mocked"
            } for q in self.questions
        ]
