import requests
from tavily import TavilyClient
from langchain_core.tools import tool
from config import SPRING_BOOT_BASE_URL, INTERNAL_API_KEY, TAVILY_API_KEY

_tavily = TavilyClient(api_key=TAVILY_API_KEY)






@tool
def get_student_profile(student_id: str) -> dict:
    """Fetch a student's profile: skills, CGPA, department, backlogs.
    Use this to understand the student's current skill level before
    building a prep roadmap."""

    response = requests.get(f"{SPRING_BOOT_BASE_URL}/internal/students/{student_id}", headers={"X-Internal-Api-Key": INTERNAL_API_KEY})

    response.raise_for_status()

    # parses the JSON and converts it into a Python object and return.
    return response.json()







@tool
def get_drive_requirements(company_id: str) -> dict:
    """Fetch the most relevant drive for a company — the currently
    active drive if one exists, otherwise the most recent past drive.
    Use this to understand what this company typically requires:
    role, required skills, rounds, and round details."""

    try:

        response = requests.get(
            f"{SPRING_BOOT_BASE_URL}/internal/companies/{company_id}/most-relevant-drive",
            headers={"X-Internal-Api-Key": INTERNAL_API_KEY}
        )
        
        response.raise_for_status()

        return response.json()
    
    except requests.exceptions.HTTPError:
        
        return {
            "info": "No drive history available for this company yet."
        }







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