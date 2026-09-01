from fastapi import FastAPI
from langchain_core.messages import HumanMessage, AIMessage

from graph import(
    prep_agent,
    research_agent,
    interview_evaluation_agent,
    interview_question_agent
)

from agents import extract_text

from models import( 
    PrepChatRequest, 
    PrepChatResponse,
    CompanyResearchRequest,
    SimplifiedResearchResponse,
    MockInterviewTurnRequest,
    MockInterviewTurnResponse
)

from research_mapper import simplify_research_response
from message_utils import count_real_questions, deserialize_history, serialize_history

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




@app.post("/research-company", response_model=SimplifiedResearchResponse)
def research_company(request: CompanyResearchRequest):

    result = research_agent.invoke({
        "messages": [HumanMessage(
            content=f"Research the company: {request.company_name}, target role: {request.role}"
        )]
    })

    return simplify_research_response(result["research_result"])




@app.post("/mock-interview/turn", response_model=MockInterviewTurnResponse)
def mock_interview_turn(request: MockInterviewTurnRequest):

    messages = deserialize_history(request.conversation_history)

    if request.student_answer:
        messages.append(HumanMessage(content=request.student_answer))
    elif not messages:
        # very first turn: no history, no answer yet — give the agent
        # something to act on so it knows to ask question 1
        messages.append(HumanMessage(content="Begin the interview."))

    questions_asked = count_real_questions(messages)

    if questions_asked >= 5:
        eval_result = interview_evaluation_agent.invoke({"messages": messages})
        return MockInterviewTurnResponse(
            question_number=5,
            question="",
            is_complete=True,
            evaluation=eval_result["interview_evaluation"],
        )

    result = interview_question_agent.invoke({
        "messages": messages,
        "round_type": request.round_type.value,
        "company_id": request.company_id,
    })

    new_question = extract_text(result["messages"][-1].content)

    return MockInterviewTurnResponse(
        question_number=questions_asked + 1,
        question=new_question,
        is_complete=False,
        conversation_history=serialize_history(result["messages"]),
    )


