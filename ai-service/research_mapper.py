from models import (
    CompanyResearchResponse,
    SimplifiedResource,
    SimplifiedResearchResponse,
)


# ============================================================
# RESOURCE TYPE MAPPING
# ============================================================

RESOURCE_TYPE_MAPPING = {

    "DSA": "PREP_MATERIAL",

    "TECHNICAL": "PREP_MATERIAL",

    "APTITUDE": "PREP_MATERIAL",

    "BEHAVIOURAL": "PREP_MATERIAL",

    "HR": "PREP_MATERIAL",

    "RECENT_NEWS": "NEWS",
}


# ============================================================
# MAP RESOURCE TYPE
# ============================================================

def _map_resource_type(
    resource
) -> str:

    if (
        resource.type.value
        == "INTERVIEW_EXPERIENCE"
    ):

        if (
            resource.format.value
            == "VIDEO"
        ):

            return (
                "INTERVIEW_EXPERIENCE_VIDEO"
            )

        return (
            "INTERVIEW_EXPERIENCE_BLOG"
        )

    return RESOURCE_TYPE_MAPPING.get(
        resource.type.value,
        "PREP_MATERIAL",
    )


# ============================================================
# SIMPLIFY RESEARCH RESPONSE
# ============================================================

def simplify_research_response(
    research: CompanyResearchResponse
) -> SimplifiedResearchResponse:

    simplified_resources = [

        SimplifiedResource(
            type=_map_resource_type(
                resource
            ),
            title=resource.title,
            url=resource.url,
        )

        for resource
        in research.suggested_resources
    ]

    simplified_news = [

        SimplifiedResource(
            type="NEWS",
            title=news.title,
            url=news.url,
        )

        for news
        in research.recent_news
    ]

    return SimplifiedResearchResponse(

        business_info=(
            research.business_info
        ),

        company_type=(
            research.company_type.value
        ),

        careers_page_url=(
            research.careers_page_url
        ),

        resources=(
            simplified_resources
            + simplified_news
        ),
    )