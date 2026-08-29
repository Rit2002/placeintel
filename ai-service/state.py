from typing import Annotated, Optional, TypedDict
from langgraph.graph.message import add_messages

from models import CompanyResearchResponse


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    research_result: Optional[CompanyResearchResponse]