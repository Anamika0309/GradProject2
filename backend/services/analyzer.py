import os
import json
from typing import Dict, Any, List
from openai import OpenAI

class RootCauseAnalyzer:
    def __init__(self):
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

    def analyze_themes(self, themes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes a list of theme dicts and adds root_cause, root_cause_label, and severity.
        """
        if not self.client:
            print("WARNING: No OPENAI_API_KEY found. Mocking root causes.")
            for theme in themes:
                theme['root_cause'] = "Users are experiencing friction due to lack of trust and familiarity."
                theme['root_cause_label'] = "Trust Gap"
                theme['severity'] = "Medium"
            return themes

        updated_themes = []
        for theme in themes:
            prompt = f"""
Analyze this user feedback theme and extract the underlying psychological or UX root cause.

Theme Name: {theme['name']}
Description: {theme['description']}

Generate a JSON object with:
{{
  "root_cause": "A 2-3 sentence explanation of the underlying psychological/UX cause driving this feedback.",
  "root_cause_label": "A short, punchy label (e.g., 'Decision Fatigue', 'Trust Gap')",
  "severity": "String (High | Medium | Low)"
}}
"""
            try:
                response = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a product strategist. Return valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    model=self.model,
                    temperature=0.4,
                    response_format={"type": "json_object"}
                )
                
                result = json.loads(response.choices[0].message.content)
                theme['root_cause'] = result.get('root_cause', '')
                theme['root_cause_label'] = result.get('root_cause_label', '')
                theme['severity'] = result.get('severity', 'Medium')
            except Exception as e:
                print(f"Error extracting root cause for theme {theme['name']}: {e}")
                theme['root_cause'] = "Error extracting root cause."
                theme['root_cause_label'] = "Error"
                theme['severity'] = "Low"
                
            updated_themes.append(theme)
            
        return updated_themes
