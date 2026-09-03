import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
INTERNAL_API_KEY = os.getenv("SPRING_INTERNAL_API_KEY")

SPRING_BOOT_BASE_URL = "http://localhost:8080/placeintel/api/v1"

MODEL_NAME = "gemini-3.6-flash"


def get_llm():
    return ChatGoogleGenerativeAI(
        model=MODEL_NAME,
        google_api_key=GEMINI_API_KEY,
    )