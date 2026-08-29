from pydantic import BaseModel, Field
from enum import Enum


# ---- Prep Agent models models ----

class PrepChatRequest(BaseModel):
    company_id: str
    student_id: str
    user_message: str


class PrepChatResponse(BaseModel):
    reply: str



# ---- Company Research Agent models ----

class CompanyTypeEnum(str, Enum):
    PRODUCT_BASED = "PRODUCT_BASED"
    SERVICE_BASED = "SERVICE_BASED"
    STARTUP = "STARTUP"
    OTHER = "OTHER"


class ResourceTypeEnum(str, Enum):
    NEWS = "NEWS"
    PREP_MATERIAL = "PREP_MATERIAL"
    INTERVIEW_EXPERIENCE_VIDEO = "INTERVIEW_EXPERIENCE_VIDEO"
    INTERVIEW_EXPERIENCE_BLOG = "INTERVIEW_EXPERIENCE_BLOG"


# Field() here is a Pydantic function used to add extra information or validation rules to a model field.
class ResourceSuggestion(BaseModel):
    type: ResourceTypeEnum
    title: str
    url: str
    relevance_note: str = Field(
        description="One sentence on why this resource is useful for students preparing for this company"
    )


class CompanyResearchRequest(BaseModel):
    company_name: str


# The Pydantic schema (CompanyResearchOutput) tells the model what shape the final answer must take

class CompanyResearchResponse(BaseModel):

    business_info: str = Field(description="4-5 sentences: what the company does, products, business model")

    company_type: CompanyTypeEnum

    careers_page_url: str = Field(description="The company's official careers/jobs page URL. If the careers page url is not found provide company's official url")

    suggested_resources: list[ResourceSuggestion] = Field(
        description="PRIORITY: find 5-8 genuinely relevant, recent resources — "
        "recent news, interview experience blogs/ youtube videos specific to "
        "this company's hiring process. This is the most valuable part "
        "of the research; spend the most search effort here."
    )