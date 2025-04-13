from typing import Optional, Dict
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class Translator:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.price = 1500  # in lamports
        self.supported_languages = {
            "en": "English",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "nl": "Dutch",
            "ru": "Russian",
            "ja": "Japanese",
            "zh": "Chinese",
            "ko": "Korean",
            "ar": "Arabic",
            # Add more languages as needed
        }

    async def translate(
        self,
        text: str,
        target_language: str,
        source_language: Optional[str] = None
    ) -> dict:
        """
        Translate text to target language
        """
        try:
            # Validate language codes
            if target_language not in self.supported_languages:
                raise ValueError(f"Unsupported target language: {target_language}")
            
            if source_language and source_language not in self.supported_languages:
                raise ValueError(f"Unsupported source language: {source_language}")

            # Create the translation prompt
            source_lang_name = self.supported_languages.get(source_language, "auto-detected")
            target_lang_name = self.supported_languages[target_language]

            prompt = f"""Translate the following text from {source_lang_name} to {target_lang_name}.
            Preserve the context, tone, and any cultural references.
            Text to translate: {text}"""

            # Get translation from OpenAI
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional translator. Provide accurate translations while preserving context and cultural nuances."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )

            translation = response.choices[0].message.content

            return {
                "original_text": text,
                "translated_text": translation,
                "source_language": source_language or "auto",
                "target_language": target_language,
                "source_language_name": source_lang_name,
                "target_language_name": target_lang_name
            }

        except Exception as e:
            print(f"Error translating text: {str(e)}")
            raise



    def get_supported_languages(self) -> Dict[str, str]:
        """Get list of supported languages"""
        return self.supported_languages 