import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

for model in client.models.list():
    # Filter for models that support text/content generation
    if "generateContent" in getattr(model, "supported_actions", []):
        print(model.name)