import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

_model = genai.GenerativeModel("gemini-1.5-flash")


def generate(system_prompt: str, user_prompt: str) -> str:
    """
    Send a system + user prompt to Gemini 1.5 Flash and return the text response.
    """
    response = _model.generate_content(
        [
            {"role": "user", "parts": [system_prompt + "\n\n" + user_prompt]},
        ]
    )
    return response.text
