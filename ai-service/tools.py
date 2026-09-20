import requests

from tavily import TavilyClient
from langchain_core.tools import tool

from config import (
    SPRING_BOOT_BASE_URL,
    INTERNAL_API_KEY,
    TAVILY_API_KEY,
)


_tavily = TavilyClient(
    api_key=TAVILY_API_KEY
)


# ============================================================
# STUDENT PROFILE
# ============================================================

@tool
def get_student_profile(
    student_id: str
) -> dict:
    """
    Fetch a student's profile including skills,
    CGPA, department, and backlogs.
    """

    response = requests.get(
        f"{SPRING_BOOT_BASE_URL}"
        f"/internal/students/{student_id}",
        headers={
            "X-Internal-Api-Key":
                INTERNAL_API_KEY
        },
        timeout=10,
    )

    response.raise_for_status()

    return response.json()


# ============================================================
# DRIVE REQUIREMENTS
# ============================================================

@tool
def get_drive_requirements(
    company_id: str
) -> dict:
    """
    Fetch the most relevant drive for a company.
    """

    try:

        response = requests.get(
            f"{SPRING_BOOT_BASE_URL}"
            f"/internal/companies/"
            f"{company_id}"
            f"/most-relevant-drive",
            headers={
                "X-Internal-Api-Key":
                    INTERNAL_API_KEY
            },
            timeout=10,
        )

        response.raise_for_status()

        return response.json()

    except requests.exceptions.HTTPError:

        return {
            "info": (
                "No drive history available "
                "for this company yet."
            )
        }

    except requests.exceptions.RequestException as e:

        return {
            "info": (
                "Unable to fetch drive requirements "
                f"at the moment: {str(e)}"
            )
        }


# ============================================================
# WEB SEARCH
# ============================================================

@tool
def web_search(
    query: str
) -> str:
    """
    Search the web for recent information about a company,
    hiring process, interview experiences, or placement trends.
    """

    try:

        results = _tavily.search(
            query=query,
            max_results=3,
        )

        formatted_results = []

        for result in results.get(
            "results",
            []
        ):

            url = result.get(
                "url",
                ""
            )

            content = result.get(
                "content",
                ""
            )

            # Keep each search result small.
            content = content[:1500]

            formatted_results.append(
                f"Source: {url}\n"
                f"{content}"
            )

        if not formatted_results:

            return "No relevant results found."

        return "\n\n".join(
            formatted_results
        )

    except Exception as e:

        print(
            f"Tavily search failed: {e}"
        )

        return (
            f"Web search failed for query: "
            f"{query}"
        )