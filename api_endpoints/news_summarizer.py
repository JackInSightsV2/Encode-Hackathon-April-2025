from typing import Optional
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class NewsSummarizer:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.price = 2000  # in lamports

    async def summarize(self, article_url: str, article_text: Optional[str] = None) -> dict:
        """
        Summarize a news article either from URL or provided text
        """
        try:
            # If no text provided, try to extract from URL
            if not article_text:
                # TODO: Implement web scraping for article text
                raise ValueError("Article text extraction not implemented yet")

            # Create the summary using OpenAI
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a professional news summarizer. 
                        Create a concise summary of the article that includes:
                        1. Main topic and key points
                        2. Important facts and figures
                        3. Key quotes if available
                        4. Context and implications
                        
                        Keep the summary under 200 words."""
                    },
                    {
                        "role": "user",
                        "content": f"Please summarize this article: {article_text}"
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )

            summary = response.choices[0].message.content

            return {
                "summary": summary,
                "original_length": len(article_text),
                "summary_length": len(summary),
                "url": article_url
            }

        except Exception as e:
            print(f"Error summarizing article: {str(e)}")
            raise

