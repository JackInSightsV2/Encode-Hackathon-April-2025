from typing import Dict
import os
from openai import OpenAI
from dotenv import load_dotenv
from .base import ExternalAPI

load_dotenv()

class StoryGenAPI(ExternalAPI):
    def __init__(self):
        super().__init__(price=2000)  # in lamports
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def call(self, prompt: str) -> Dict:
        """
        Generate a story based on the given prompt
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a creative story writer. Generate engaging and imaginative stories based on the given prompt."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )

            story = response.choices[0].message.content

            return {
                "prompt": prompt,
                "story": story,
                "status": "success"
            }

        except Exception as e:
            print(f"Error generating story: {str(e)}")
            raise 