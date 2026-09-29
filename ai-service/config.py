import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq


load_dotenv()


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
INTERNAL_API_KEY = os.getenv("SPRING_INTERNAL_API_KEY")


# ============================================================
# SPRING BOOT
# ============================================================

SPRING_BOOT_BASE_URL = os.getenv(
    "SPRING_BOOT_BASE_URL"
)


# ============================================================
# LLM
# ============================================================

MODEL_NAME = "openai/gpt-oss-120b"


def get_llm():
    """
    General-purpose Groq LLM used by agents.
    """
    return ChatGroq(
        model=MODEL_NAME,
        groq_api_key=GROQ_API_KEY,
        temperature=0.2,
        max_tokens=2500,
        streaming=True,
    )




def get_structured_llm():
    """
    LLM used for structured JSON-schema generation.
    Needs a larger completion budget because the response
    contains multiple nested objects/lists.
    """
    return ChatGroq(
        model=MODEL_NAME,
        groq_api_key=GROQ_API_KEY,
        temperature=0.1,
        max_tokens=1800,
        streaming=False,
    )