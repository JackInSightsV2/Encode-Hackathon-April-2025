from typing import Optional, Dict
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class StoryGen:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.price = 2000  # in lamports

    async def generate_story(self, prompt: str) -> dict:
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
                "story": story
            }

        except Exception as e:
            print(f"Error generating story: {str(e)}")
            raise


