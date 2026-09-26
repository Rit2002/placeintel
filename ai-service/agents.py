from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
    AIMessage,
    ToolMessage,
)

from config import get_llm
from state import AgentState

from tools import (
    get_student_profile,
    get_drive_requirements,
    web_search,
)

from models import (
    CompanyResearchResponse,
    InterviewEvaluation,
)

from prompts import (
    PREP_AGENT_SYSTEM_PROMPT,
    COMPANY_RESEARCH_SYSTEM_PROMPT,
    INTERVIEW_QUESTION_SYSTEM_PROMPT,
    INTERVIEW_EVALUATION_SYSTEM_PROMPT,
)

from message_utils import (
    count_real_questions,
    extract_text,
)


# ============================================================
# PREPARATION AGENT
# ============================================================

prep_tools = [
    get_student_profile,
    get_drive_requirements,
    web_search,
]

prep_llm_with_tools = get_llm().bind_tools(
    prep_tools
)


async def prep_agent_node(
    state: AgentState
):

    messages = state["messages"]

    if not any(
        isinstance(
            message,
            SystemMessage
        )
        for message in messages
    ):

        messages = [
            SystemMessage(
                content=PREP_AGENT_SYSTEM_PROMPT
            )
        ] + messages

    response = await prep_llm_with_tools.ainvoke(
        messages
    )

    return {
        "messages": [response]
    }


# ============================================================
# COMPANY RESEARCH AGENT
# ============================================================

research_tools = [
    web_search
]

research_llm_with_tools = get_llm().bind_tools(
    research_tools
)

research_llm_structured = get_llm().with_structured_output(
    CompanyResearchResponse,
    method="json_schema",
    strict=True,
)


def research_agent_node(
    state: AgentState
):

    messages = state["messages"]

    if not any(
        isinstance(
            message,
            SystemMessage
        )
        for message in messages
    ):

        messages = [
            SystemMessage(
                content=COMPANY_RESEARCH_SYSTEM_PROMPT
            )
        ] + messages

    response = research_llm_with_tools.invoke(
        messages
    )

    return {
        "messages": [response]
    }


# ============================================================
# RESEARCH EXTRACTION
# ============================================================

def extract_research_text(
    state: AgentState
) -> str:
    """
    Extract only useful research information from the graph
    history.

    Tool results are included because they contain the actual
    web research.

    Final AI messages without tool calls are also included.
    """

    research_parts = []

    for message in state["messages"]:

        # ----------------------------------------------------
        # TOOL RESULTS
        # ----------------------------------------------------

        if isinstance(
            message,
            ToolMessage
        ):

            content = extract_text(
                message.content
            ).strip()

            if content:
                research_parts.append(
                    content
                )

        # ----------------------------------------------------
        # FINAL AI RESPONSE
        # ----------------------------------------------------

        elif isinstance(
            message,
            AIMessage
        ):

            if (
                not message.tool_calls
                and message.content
            ):

                content = extract_text(
                    message.content
                ).strip()

                if content:
                    research_parts.append(
                        content
                    )

    research_text = "\n\n".join(
        research_parts
    )

    # --------------------------------------------------------
    # HARD INPUT LIMIT
    # --------------------------------------------------------
    #
    # Your Groq organization has an 8k TPM limit.
    # Keep the formatter input comfortably below that.
    #
    # --------------------------------------------------------

    MAX_RESEARCH_CHARS = 7000

    if len(research_text) > MAX_RESEARCH_CHARS:

        research_text = (
            research_text[
                :MAX_RESEARCH_CHARS
            ]
            + "\n\n[Research truncated]"
        )

    return research_text


# ============================================================
# FORMAT RESEARCH OUTPUT
# ============================================================

def format_research_output_node(
    state: AgentState
):

    research_text = extract_research_text(
        state
    )

    formatter_prompt = f"""
Convert the research below into the
CompanyResearchResponse schema.

Rules:
- Use ONLY the information provided below.
- Do NOT perform additional research.
- Do NOT call tools.
- Do NOT invent missing information.
- Keep every field concise.
- Preserve URLs and dates when available.
- Treat candidate experiences as individual reports.
- Return only information supported by the research.

RESEARCH:

{research_text}
"""

    structured_result = (
        research_llm_structured.invoke(
            formatter_prompt
        )
    )

    return {
        "research_result": structured_result
    }


# ============================================================
# MOCK INTERVIEW AGENT
# ============================================================

interview_tools = [
    get_drive_requirements,
    web_search,
]

interview_llm_with_tools = get_llm().bind_tools(
    interview_tools
)

interview_llm_structured = get_llm().with_structured_output(
    InterviewEvaluation,
    method="json_schema",
    strict=True,
)


# ============================================================
# INTERVIEW QUESTION
# ============================================================

async def interview_question_node(
    state: AgentState
):

    messages = state["messages"]

    question_number = (
        count_real_questions(messages)
        + 1
    )

    # Remove system messages from the history.
    non_system_messages = [
        message
        for message in messages
        if not isinstance(
            message,
            SystemMessage
        )
    ]

    system_prompt = (
        INTERVIEW_QUESTION_SYSTEM_PROMPT.format(
            round_type=state[
                "round_type"
            ],
            company_id=state[
                "company_id"
            ],
            question_number=question_number,
        )
    )

    full_messages = [
        SystemMessage(
            content=system_prompt
        )
    ] + non_system_messages

    response = (
        await interview_llm_with_tools.ainvoke(
            full_messages
        )
    )

    return {
        "messages": [response]
    }


# ============================================================
# INTERVIEW EVALUATION
# ============================================================

def interview_evaluation_node(
    state: AgentState
):

    messages = state["messages"]

    # Remove system messages.
    non_system_messages = [
        message
        for message in messages
        if not isinstance(
            message,
            SystemMessage
        )
    ]

    # --------------------------------------------------------
    # Build a compact transcript.
    #
    # We do NOT send tool messages to the evaluator.
    # The evaluator only needs the actual interview.
    # --------------------------------------------------------

    transcript_parts = []

    for message in non_system_messages:

        if isinstance(
            message,
            HumanMessage
        ):

            content = extract_text(
                message.content
            ).strip()

            if content:
                transcript_parts.append(
                    f"STUDENT:\n{content}"
                )

        elif isinstance(
            message,
            AIMessage
        ):

            # Ignore AI tool-call messages.
            if message.tool_calls:
                continue

            content = extract_text(
                message.content
            ).strip()

            if content:
                transcript_parts.append(
                    f"INTERVIEWER:\n{content}"
                )

    transcript = "\n\n".join(
        transcript_parts
    )

    # --------------------------------------------------------
    # Safety limit.
    # --------------------------------------------------------

    MAX_TRANSCRIPT_CHARS = 7000

    if len(transcript) > MAX_TRANSCRIPT_CHARS:

        transcript = (
            transcript[
                :MAX_TRANSCRIPT_CHARS
            ]
            + "\n\n[Transcript truncated]"
        )

    system_prompt = (
        INTERVIEW_EVALUATION_SYSTEM_PROMPT.format(
            round_type=state[
                "round_type"
            ],
            company_id=state[
                "company_id"
            ],
        )
    )

    evaluation_prompt = f"""
{system_prompt}

INTERVIEW TRANSCRIPT:

{transcript}
"""

    evaluation = (
        interview_llm_structured.invoke(
            evaluation_prompt
        )
    )

    return {
        "interview_evaluation": evaluation
    }