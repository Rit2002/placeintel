from models import (
    CompanyResearchResponse,
    SimplifiedResource,
    SimplifiedResearchResponse,
)





RESOURCE_TYPE_MAPPING = {
    "DSA": "PREP_MATERIAL",
    "TECHNICAL": "PREP_MATERIAL",
    "APTITUDE": "PREP_MATERIAL",
    "BEHAVIOURAL": "PREP_MATERIAL",
    "HR": "PREP_MATERIAL",
    "RECENT_NEWS": "NEWS",
}





# Function take one resource and checks the weather the interview_experience is a video or blog returns accordingly and also handles rest of the resource mapping
def _map_resource_type(resource) -> str:

    if resource.type.value == "INTERVIEW_EXPERIENCE":
        # python's ternary expression
        return "INTERVIEW_EXPERIENCE_VIDEO" if resource.format.value == "VIDEO" else "INTERVIEW_EXPERIENCE_BLOG"
    
                                # .get(key, default)
    return RESOURCE_TYPE_MAPPING.get(resource.type.value, "PREP_MATERIAL")







def simplify_research_response(research: CompanyResearchResponse) -> SimplifiedResearchResponse:

    # creating a list conprehension of resources
    simplified_resources = [
        # creating a object of simplifiedResource for every suggested_reource
        SimplifiedResource(
            type=_map_resource_type(r),
            title=r.title,
            url=r.url,
        )
        for r in research.suggested_resources
    ]

    # creating list comprehension of news
    simplified_news = [
        # creating a object of simplifiedResource for every suggested_reource
        SimplifiedResource(
            type="NEWS",
            title=n.title,
            url=n.url,
        )
        for n in research.recent_news
    ]

    return SimplifiedResearchResponse(
        business_info=research.business_info,
        company_type=research.company_type.value,
        careers_page_url=research.careers_page_url,
        resources=simplified_resources + simplified_news,
    )