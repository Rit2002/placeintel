import json

from fastapi import (
    FastAPI,
    HTTPException,
)

from fastapi.responses import (
    StreamingResponse,
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
    CompanyResearchRequest,
    SimplifiedResearchResponse,
    MockInterviewTurnRequest,
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
#
# NOTE: this raises HTTPException, which only works for
# normal (non-streaming) responses. Streaming routes cannot
# use this once the response has started — see
# `format_stream_error` below for the streaming equivalent.
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


def is_rate_limit_error(
    error: Exception
) -> bool:

    error_text = str(error)

    return (
        "413" in error_text
        or "TPM" in error_text
        or "Request too large" in error_text
        or "rate limit" in error_text.lower()
        or "RESOURCE_EXHAUSTED" in error_text
    )


def format_stream_error(
    error: Exception
) -> str:
    """
    Streaming equivalent of handle_llm_error.

    The HTTP status/headers are already sent once a
    StreamingResponse starts, so errors have to be
    delivered as a final SSE event instead of an
    HTTPException.
    """

    print(
        f"LLM STREAM ERROR: {str(error)}"
    )

    if is_rate_limit_error(error):

        message = (
            "AI service request exceeded the current "
            "model token/rate limit. Please try again "
            "shortly."
        )

    else:

        message = (
            "AI service encountered an internal error."
        )

    payload = {
        "type": "error",
        "message": message,
    }

    return (
        f"event: error\n"
        f"data: {json.dumps(payload)}\n\n"
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
# PREP CHAT (STREAMING)
# ============================================================
#
# Streams raw answer tokens as they are generated.
# Each SSE `data:` line is one chunk of the reply text.
# The stream ends with a `data: [DONE]` sentinel, or an
# `event: error` on failure.
#
# The non-streaming /prep-chat route has been removed —
# this is now the only prep-chat endpoint.
# ============================================================

async def stream_prep_chat(
    request: PrepChatRequest
):

    initial_content = (
        f"Student ID: {request.student_id}\n"
        f"Company ID: {request.company_id}\n"
        f"Student's question: "
        f"{request.user_message}"
    )

    try:

        async for event in prep_agent.astream_events(
            {
                "messages": [
                    HumanMessage(
                        content=initial_content
                    )
                ]
            },
            version="v2",
        ):

            kind = event["event"]

            # ------------------------------------------------
            # Answer tokens.
            #
            # Tool-call chunks also fire "on_chat_model_stream"
            # events but carry empty `.content`, so they are
            # naturally skipped here.
            # ------------------------------------------------

            if kind == "on_chat_model_stream":

                chunk = event["data"]["chunk"]

                if chunk.content:

                    # json.dumps() escapes any embedded
                    # newlines in the token — raw `\n` in a
                    # `data:` line would be invalid SSE
                    # framing (it would look like a second,
                    # prefix-less line and split the event).
                    yield (
                        f"data: {json.dumps(chunk.content)}\n\n"
                    )

            # ------------------------------------------------
            # Optional: let the frontend show a
            # "checking drive requirements..." style status
            # while a tool call is in flight.
            # ------------------------------------------------

            elif kind == "on_tool_start":

                yield (
                    f"event: tool\n"
                    f"data: {event['name']}\n\n"
                )

        yield "data: [DONE]\n\n"

    except Exception as e:

        yield format_stream_error(e)


@app.post(
    "/prep-chat"
)
async def prep_chat(
    request: PrepChatRequest
):

    return StreamingResponse(
        stream_prep_chat(request),
        media_type="text/event-stream",
    )


# ============================================================
# COMPANY RESEARCH
# ============================================================
#
# Left as a single non-streaming response: the final output
# is a structured object (CompanyResearchResponse) produced
# via strict structured output, which does not token-stream
# into a meaningful partial result.
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
# MOCK INTERVIEW (STREAMING)
# ============================================================
#
# Streams the interview question as it is generated, then
# sends one final `type: done` SSE event carrying the same
# metadata the old MockInterviewTurnResponse carried
# (question_number, is_complete, conversation_history,
# evaluation). The client should accumulate `type: token`
# events for live display, then read the final `type: done`
# event for the authoritative state to persist/send back on
# the next turn.
#
# The interview-complete branch (evaluation) is NOT streamed
# token-by-token — InterviewEvaluation is structured output,
# same reasoning as /research-company — but it is still
# delivered as a single `type: done` SSE event so the client
# only needs to speak one protocol.
#
# The non-streaming /mock-interview/turn route has been
# removed — this is now the only mock-interview endpoint.
# ============================================================

async def stream_mock_interview_turn(
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
        # Interview complete: evaluate (not streamed
        # token-by-token — see note above), send as one
        # `done` event.
        # ----------------------------------------------------

        if questions_asked >= 5:

            eval_result = (
                await interview_evaluation_agent.ainvoke(
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

            payload = {
                "type": "done",
                "question_number": 5,
                "question": "",
                "is_complete": True,
                "conversation_history": None,
                "evaluation": (
                    eval_result[
                        "interview_evaluation"
                    ].model_dump()
                ),
            }

            yield f"data: {json.dumps(payload)}\n\n"
            return

        # ----------------------------------------------------
        # Generate next question, streamed token-by-token.
        # ----------------------------------------------------

        final_state = None

        async for event in interview_question_agent.astream_events(
            {
                "messages": messages,
                "round_type": (
                    request.round_type.value
                ),
                "company_id": (
                    request.company_id
                ),
            },
            version="v2",
        ):

            kind = event["event"]

            if kind == "on_chat_model_stream":

                chunk = event["data"]["chunk"]

                if chunk.content:

                    token_payload = {
                        "type": "token",
                        "text": chunk.content,
                    }

                    yield (
                        f"data: {json.dumps(token_payload)}\n\n"
                    )

            elif kind == "on_tool_start":

                yield (
                    f"event: tool\n"
                    f"data: {event['name']}\n\n"
                )

            elif (
                kind == "on_chain_end"
                and event.get("name") == "LangGraph"
            ):

                final_state = event["data"]["output"]

        if final_state is None:

            raise RuntimeError(
                "Interview question graph produced no "
                "final state."
            )

        new_question = extract_text(
            final_state["messages"][-1].content
        )

        done_payload = {
            "type": "done",
            "question_number": (
                questions_asked + 1
            ),
            "question": new_question,
            "is_complete": False,
            "conversation_history": (
                serialize_history(
                    final_state["messages"]
                )
            ),
            "evaluation": None,
        }

        yield f"data: {json.dumps(done_payload)}\n\n"

    except Exception as e:

        yield format_stream_error(e)


@app.post(
    "/mock-interview/turn"
)
async def mock_interview_turn(
    request: MockInterviewTurnRequest
):

    return StreamingResponse(
        stream_mock_interview_turn(request),
        media_type="text/event-stream",
    )