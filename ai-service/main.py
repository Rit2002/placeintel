from fastapi import (
    FastAPI,
    HTTPException,
)

from langchain_core.messages import (
    HumanMessage,
)

from graph import (
    prep_agent,
    research_agent,
    interview_evaluation_agent,
    interview_question_agent,
)

from models import (
    PrepChatRequest,
    PrepChatResponse,
    CompanyResearchRequest,
    SimplifiedResearchResponse,
    MockInterviewTurnRequest,
    MockInterviewTurnResponse,
)

from research_mapper import (
    simplify_research_response,
)

from message_utils import (
    count_real_questions,
    deserialize_history,
    serialize_history,
    extract_text,
)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="PlaceIntel AI Service"
)


# ============================================================
# ERROR HANDLING
# ============================================================

def handle_llm_error(
    error: Exception
):

    error_text = str(error)

    print(
        f"LLM ERROR: {error_text}"
    )

    if (
        "413" in error_text
        or "TPM" in error_text
        or "Request too large" in error_text
        or "rate limit" in error_text.lower()
        or "RESOURCE_EXHAUSTED" in error_text
    ):

        raise HTTPException(
            status_code=503,
            detail=(
                "AI service request exceeded the current "
                "model token/rate limit. The request was "
                "automatically kept within a smaller context, "
                "but the provider may still be rate limited. "
                "Please try again shortly."
            ),
        )

    raise HTTPException(
        status_code=500,
        detail=(
            "AI service encountered an internal error."
        ),
    )


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "ok",
        "service": "placeintel-ai-service",
    }


# ============================================================
# PREP CHAT
# ============================================================

@app.post(
    "/prep-chat",
    response_model=PrepChatResponse,
)
def prep_chat(
    request: PrepChatRequest
):

    initial_content = (
        f"Student ID: {request.student_id}\n"
        f"Company ID: {request.company_id}\n"
        f"Student's question: "
        f"{request.user_message}"
    )

    try:

        result = prep_agent.invoke(
            {
                "messages": [
                    HumanMessage(
                        content=initial_content
                    )
                ]
            }
        )

        final_content = (
            result["messages"][-1].content
        )

        return PrepChatResponse(
            reply=extract_text(
                final_content
            )
        )

    except Exception as e:

        handle_llm_error(e)


# ============================================================
# COMPANY RESEARCH
# ============================================================

@app.post(
    "/research-company",
    response_model=SimplifiedResearchResponse,
)
def research_company(
    request: CompanyResearchRequest
):

    try:

        result = research_agent.invoke(
            {
                "messages": [
                    HumanMessage(
                        content=(
                            f"Research the company: "
                            f"{request.company_name}, "
                            f"target role: "
                            f"{request.role}"
                        )
                    )
                ]
            }
        )

        return simplify_research_response(
            result["research_result"]
        )

    except Exception as e:

        handle_llm_error(e)


# ============================================================
# MOCK INTERVIEW
# ============================================================

@app.post(
    "/mock-interview/turn",
    response_model=MockInterviewTurnResponse,
)
def mock_interview_turn(
    request: MockInterviewTurnRequest
):

    try:

        # ----------------------------------------------------
        # Deserialize previous frontend history.
        # ----------------------------------------------------

        messages = deserialize_history(
            request.conversation_history
        )

        # ----------------------------------------------------
        # Add student's latest answer.
        # ----------------------------------------------------

        if request.student_answer:

            messages.append(
                HumanMessage(
                    content=request.student_answer
                )
            )

        elif not messages:

            # First request.
            messages.append(
                HumanMessage(
                    content="Begin the interview."
                )
            )

        # ----------------------------------------------------
        # Count questions already asked.
        # ----------------------------------------------------

        questions_asked = (
            count_real_questions(
                messages
            )
        )

        # ----------------------------------------------------
        # Interview complete.
        # ----------------------------------------------------

        if questions_asked >= 5:

            eval_result = (
                interview_evaluation_agent.invoke(
                    {
                        "messages": messages,
                        "round_type": (
                            request.round_type.value
                        ),
                        "company_id": (
                            request.company_id
                        ),
                    }
                )
            )

            return MockInterviewTurnResponse(
                question_number=5,
                question="",
                is_complete=True,
                evaluation=(
                    eval_result[
                        "interview_evaluation"
                    ]
                ),
            )

        # ----------------------------------------------------
        # Generate next question.
        # ----------------------------------------------------

        result = (
            interview_question_agent.invoke(
                {
                    "messages": messages,
                    "round_type": (
                        request.round_type.value
                    ),
                    "company_id": (
                        request.company_id
                    ),
                }
            )
        )

        new_question = extract_text(
            result["messages"][-1].content
        )

        return MockInterviewTurnResponse(
            question_number=(
                questions_asked + 1
            ),
            question=new_question,
            is_complete=False,
            conversation_history=(
                serialize_history(
                    result["messages"]
                )
            ),
        )

    except Exception as e:

        handle_llm_error(e)