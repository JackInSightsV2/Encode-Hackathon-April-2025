from typing import Optional, Dict
import os
from openai import OpenAI
from dotenv import load_dotenv
from .base import ExternalAPI

load_dotenv()

class NewsSummarizerAPI(ExternalAPI):
    def __init__(self):
        super().__init__(price=1000)  # in lamports
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def call(self, article_url: Optional[str] = None, article_text: Optional[str] = None) -> Dict:
        """
        Summarize an article from URL or text
        """
        try:
            if not article_url and not article_text:
                raise ValueError("Either article_url or article_text must be provided")

            # Create the summarization prompt
            prompt = f"""Summarize the following article{' from URL: ' + article_url if article_url else ': ' + article_text}
            Focus on the main points and key takeaways.
            Keep the summary concise and informative."""

            # Get summary from OpenAI
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional news summarizer. Provide concise and informative summaries of news articles."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )

            summary = response.choices[0].message.content

            return {
                "summary": summary,
                "source": article_url or "text",
                "status": "success"
            }

        except Exception as e:
            print(f"Error summarizing article: {str(e)}")
            raise 