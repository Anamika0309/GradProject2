import os
import json
from typing import Dict, Any, List
from openai import OpenAI

class OpportunityGenerator:
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

    def generate_opportunities(self, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generates top 5 product opportunities based on executive findings.
        """
        if not self.client:
            print("WARNING: No OPENAI_API_KEY. Mocking opportunities.")
            return self._mock_opportunities()
            
        findings_summary = "\\n".join([f"Q: {f['question_text']}\\nA: {f['answer']}" for f in findings])
        
        prompt = f"""
You are an expert Growth Product Manager at Blinkit. Based on the following research findings, propose the top 5 product opportunities to solve user friction and drive category discovery.

Research Findings:
{findings_summary}

Generate a JSON object with a single key "opportunities" containing a list of 5 objects matching this schema:
{{
  "title": "Opportunity Name (e.g., Smart Category Nudges)",
  "problem": "Specific user friction being solved",
  "user_need": "Underlying job-to-be-done",
  "product_opportunity": "Suggested feature or experience",
  "business_impact": "Impact on AOV/MACs/CLV",
  "primary_segment": "Target user segment",
  "mention_rate": "Estimated % of users facing this",
  "opportunity_score": Integer (1-10),
  "representative_quote": "A supporting quote synthesized from findings"
}}
"""
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a product analytics engine. Return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.6,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get("opportunities", [])
        except Exception as e:
            print(f"Error generating opportunities: {e}")
            return []

    def _mock_opportunities(self):
        return [
            {
                "title": "Smart Category Nudges in Reorder Flow",
                "problem": "Users only buy what they know.",
                "user_need": "Make trying new things frictionless.",
                "product_opportunity": "Inject 1 new category item into the reorder screen.",
                "business_impact": "High AOV impact",
                "primary_segment": "habitual_buyer",
                "mention_rate": "45%",
                "opportunity_score": 9,
                "representative_quote": "I just click reorder because I'm lazy."
            }
        ]
