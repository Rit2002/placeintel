from pydantic import BaseModel


class PrepChatRequest(BaseModel):
    company_id: str
    student_id: str
    user_message: str


class PrepChatResponse(BaseModel):
    reply: str