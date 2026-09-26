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

SPRING_BOOT_BASE_URL = "http://localhost:8080/placeintel/api/v1"


# ============================================================
# LLM
# ============================================================

MODEL_NAME = "openai/gpt-oss-120b"


def get_llm():
    """
    Create the Groq LLM used by the agents.

    max_tokens is deliberately limited so that we don't
    unnecessarily reserve a huge completion budget on Groq.
    """

    return ChatGroq(
        model=MODEL_NAME,
        groq_api_key=GROQ_API_KEY,
        temperature=0.2,
        max_tokens=2048,
        streaming=True,
    )