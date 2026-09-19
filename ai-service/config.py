import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
INTERNAL_API_KEY = os.getenv("SPRING_INTERNAL_API_KEY")

SPRING_BOOT_BASE_URL = "http://localhost:8080/placeintel/api/v1"

MODEL_NAME = "openai/gpt-oss-120b"


def get_llm():
    return ChatGroq(
        model=MODEL_NAME,
        groq_api_key=GROQ_API_KEY,
        temperature=0.2,
    )