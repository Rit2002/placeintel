from langchain_core.messages import SystemMessage
from config import get_llm
from state import AgentState
from tools import get_student_profile, get_drive_requirements, web_search



tools = [get_student_profile, get_drive_requirements, web_search]

llm_with_tools = get_llm().bind_tools(tools)



PREP_AGENT_SYSTEM_PROMPT = """You are a placement preparation assistant for a college placement platform.
Your job is to help students prepare for a specific company's hiring drive.

You have access to tools to fetch the student's profile, the drive's
requirements, and to search the web for recent hiring information.

Use get_student_profile and get_drive_requirements to understand the
student's current skills and what the drive actually requires.
Use web_search only when you need recent, up-to-date information not
available from the platform's own data — for example, recent interview
experiences or changes in a company's hiring pattern.

Once you have enough information, respond with a clear, personalized,
day-by-day or week-by-week preparation roadmap based on the student's
stated timeframe. Be specific and practical, not generic."""



# add to agents.py

def extract_text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and "text" in block:
                parts.append(block["text"])
            elif isinstance(block, str):
                parts.append(block)
        return "".join(parts)
    return str(content)




def prep_agent_node(state: AgentState):

    messages = state["messages"]

    # any() --> checks weather at least one value is True.
    # Meaning: Is there at least one SystemMessage.
    # If system msg is not found than concat student's query + system prompt
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [
            SystemMessage(content=PREP_AGENT_SYSTEM_PROMPT)
        ] + messages

    response = llm_with_tools.invoke(messages)

    return {"messages": [response]}



