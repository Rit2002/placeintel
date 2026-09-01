from typing import Optional
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
    RECENT_NEWS = "RECENT_NEWS"
    DSA = "DSA"
    TECHNICAL = "TECHNICAL"
    APTITUDE = "APTITUDE"
    BEHAVIOURAL = "BEHAVIOURAL"
    HR = "HR"
    INTERVIEW_EXPERIENCE = "INTERVIEW_EXPERIENCE"




class ResourceFormatEnum(str, Enum):
    VIDEO = "VIDEO"
    PLAYLIST = "PLAYLIST"
    ARTICLE = "ARTICLE"
    PRACTICE_SHEET = "PRACTICE_SHEET"
    QUESTION_BANK = "QUESTION_BANK"
    INTERVIEW_EXPERIENCE = "INTERVIEW_EXPERIENCE"




class ResourceCostEnum(str, Enum):
    FREE = "FREE"
    FREEMIUM = "FREEMIUM"





class ResourceSuggestion(BaseModel):
    type: ResourceTypeEnum
    format: ResourceFormatEnum
    cost: ResourceCostEnum
    title: str
    url: str
    relevance_note: str






class RecentNews(BaseModel):
    title: str
    url: str
    published_date: str
    summary: str






class CompanyResearchRequest(BaseModel):
    company_name: str
    role : str





# The Pydantic schema (CompanyResearchOutput) tells the model what shape the final answer must take

class CompanyResearchResponse(BaseModel):

    business_info: str = Field(
        description=(
            "2-3 concise sentences explaining what the company does, "
            "its major products/services, and business model."
        )
    )

    company_type: CompanyTypeEnum

    careers_page_url: str = Field(
        description=(
            "The company's official careers/jobs page URL. "
            "If not found, use the company's official website URL."
        )
    )

    recent_news: list[RecentNews] = Field(
        description=(
            "Return 3-5 recent and relevant news items about the company, "
            "preferably from the last 12 months. Include the title, URL, "
            "publication date, and a concise summary of why each item is "
            "relevant. Prioritize official announcements and reputable "
            "news sources."
        )
    )

    suggested_resources: list[ResourceSuggestion] = Field(
        description=(
            "Return 8-12 genuinely useful resources for college placement "
            "preparation for this company and the target role. Cover multiple "
            "relevant categories such as DSA, technical, aptitude, behavioural, "
            "HR, and interview experiences. Prefer company-specific and "
            "role-specific resources. Include a useful mix of YouTube videos "
            "or playlists, practice sheets, question banks, articles, and "
            "first-hand interview experiences when high-quality resources "
            "exist. Prefer recent resources, especially from the last 1-2 "
            "years. Do not pad the list with generic or low-quality resources "
            "just to reach the requested number."
        )
    )





class SimplifiedResource(BaseModel):
    type: str      
    title: str
    url: str





class SimplifiedResearchResponse(BaseModel):
    business_info: str
    company_type: str        
    careers_page_url: str
    resources: list[SimplifiedResource]





# ---------------- Mock Interview Agnet ----------------------


class InterviewRoundType(str, Enum):
    TECHNICAL = "TECHNICAL"
    HR = "HR"
    APTITUDE = "APTITUDE"
    MANAGERIAL = "MANAGERIAL"


class MockInterviewStartRequest(BaseModel):
    company_id: str
    student_id: str
    round_type: InterviewRoundType


class MockInterviewTurnRequest(BaseModel):
    company_id: str
    student_id: str
    round_type: InterviewRoundType
    conversation_history: list[dict]  # full transcript so far, sent back by frontend each turn
    student_answer: str  # the student's latest answer (empty string for the very first call)


class MockInterviewTurnResponse(BaseModel):
    question_number: int         # 1 through 5
    question: str                 # empty once interview is complete
    is_complete: bool
    evaluation: Optional["InterviewEvaluation"] = None   # only populated when is_complete = True
    conversation_history: Optional[list[dict]] = None


class QuestionFeedback(BaseModel):
    question: str
    answer_summary: str
    strengths: str
    improvement_areas: str


class InterviewEvaluation(BaseModel):
    overall_score: int = Field(description="0-100 overall performance score")
    overall_feedback: str = Field(description="2-3 sentence summary of overall performance")
    per_question_feedback: list[QuestionFeedback]
    key_strengths: list[str]
    key_improvement_areas: list[str]