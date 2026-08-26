import os
import requests
from tavily import TavilyClient
from langchain_core.tools import tool

SPRING_BOOT_BASE_URL = "http://localhost:8080/placeintel/api/v1"

_tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

INTERNAL_API_KEY = os.getenv("SPRING_INTERNAL_API_KEY")





@tool
def get_student_profile(student_id: str) -> dict:
    """Fetch a student's profile: skills, CGPA, department, backlogs.
    Use this to understand the student's current skill level before
    building a prep roadmap."""

    response = requests.get(f"{SPRING_BOOT_BASE_URL}/internal/students/{student_id}")

    response.raise_for_status()

    # parses the JSON and converts it into a Python object and return.
    return response.json()







@tool
def get_drive_requirements(drive_id: str) -> dict:
    """Fetch a specific drive's requirements: role, required skills,
    rounds, and round details. Use this to know what the student needs
    to prepare for."""

    response = requests.get(f"{SPRING_BOOT_BASE_URL}/drives/{drive_id}")

    # response.raise_for_status() is a method from Python's requests library that checks whether the HTTP request succeeded.
    response.raise_for_status()

    return response.json()







@tool
def web_search(query: str) -> str:
    """Search the web for recent information about a company's hiring
    pattern, interview process, or recent placement trends. Use this
    when you need up-to-date information not available in the platform's
    own data — for example, recent interview experiences or changes in
    a company's hiring process."""

    results = _tavily.search(query=query, max_results=3)

    formatted = "\n\n".join(
        f"Source: {r['url']}\n{r['content']}" for r in results.get("results", [])
    )
    
    return formatted or "No relevant results found."