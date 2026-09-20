from typing import (
    Annotated,
    Optional,
    TypedDict,
)

from langgraph.graph.message import (
    add_messages,
)

from models import (
    CompanyResearchResponse,
    InterviewEvaluation,
)


class AgentState(TypedDict):

    messages: Annotated[
        list,
        add_messages
    ]

    research_result: Optional[
        CompanyResearchResponse
    ]

    interview_evaluation: Optional[
        InterviewEvaluation
    ]

    round_type: Optional[str]

    company_id: Optional[str]