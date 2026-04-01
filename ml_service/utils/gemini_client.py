import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

def generate(system_prompt: str, user_prompt: str) -> str:
    """
    Send a system + user prompt to Gemini 2.0 Flash and return the text response.
    """
    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=system_prompt + "\n\n" + user_prompt,
    )
    return response.text