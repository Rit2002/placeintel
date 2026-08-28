from fastapi import FastAPI
from langchain_core.messages import HumanMessage

from graph import prep_agent
from agents import extract_text
from models import PrepChatRequest, PrepChatResponse

app = FastAPI(title="PlaceIntel AI Service")



@app.get("/health")
def health_check():
    return {
        "status" : "ok",
        "service" : "placeintel-ai-service"
    }




@app.post("/prep-chat", response_model=PrepChatResponse)
def prep_chat(request: PrepChatRequest):

    initial_content = (
        f"Student ID: {request.student_id}\n"
        f"Company ID: {request.company_id}\n"
        f"Student's question: {request.user_message}"
    )

    result = prep_agent.invoke({
        "messages": [HumanMessage(content=initial_content)]
    })

    final_content = result["messages"][-1].content

    return PrepChatResponse(reply=extract_text(final_content))