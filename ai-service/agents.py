from langchain_core.messages import SystemMessage
from config import get_llm
from state import AgentState
from tools import get_student_profile, get_drive_requirements, web_search
from models import CompanyResearchResponse



prep_tools = [get_student_profile, get_drive_requirements, web_search]
prep_llm_with_tools = get_llm().bind_tools(prep_tools)

research_tools = [web_search]
research_llm_with_tools = get_llm().bind_tools(research_tools)
research_llm_structured = get_llm().with_structured_output(CompanyResearchResponse)



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


# The system prompt tells the model what to do — its task, its priorities, its constraints in natural language
COMPANY_RESEARCH_SYSTEM_PROMPT = """You are an expert researcher about companies. You are researching a company for a college
placement platform, to help TPO staff prepare a company profile and help
students find genuinely useful preparation material.

Your MOST IMPORTANT task is finding high-quality preparation resources:
- Recent news about the company (funding, expansion, layoffs, product launches)
- Genuine interview experience blogs or videos specific to this company's
  hiring process
- Prep material (guides, question banks) if genuinely relevant and specific
- Prioritize recent (last 1-2 years), specific, and directly relevant
  sources over generic ones

Secondary tasks (keep brief):
- A short business description (2-3 sentences)
- The company type
- The company's official careers page URL

Do not research or invent anything about interview rounds, cutoffs, CTC,
or hiring criteria — that information is specific to each college's
arrangement with the company and is not part of your research.

If you can't find enough genuinely relevant resources, return fewer
rather than padding with low-quality or irrelevant links."""


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
    # If system msg is not found than concate student's query + system prompt
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [
            SystemMessage(content=PREP_AGENT_SYSTEM_PROMPT)
        ] + messages

    response = prep_llm_with_tools.invoke(messages)

    return {"messages": [response]}




def research_agent_node(state: AgentState):

    # the entire conversation accumulated history so far
    messages = state["messages"]

    # Injects the system prompt once when user queries for first time, when the state contains only HumanMessage() . why the check? this fn might me called again and again
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [
            SystemMessage(content=COMPANY_RESEARCH_SYSTEM_PROMPT)
        ] + messages

    response = research_llm_with_tools.invoke(state["messages"])

    return {"messages": [response]}


# It takes the entire conversation so far (system prompt + all the research the model gathered via tool calls, all sitting in messages) and hands it to the structured LLM, asking it to distill everything gathered into the exact CompanyResearchResponse shape.
def format_research_output_node(state: AgentState):

    structured_result = research_llm_structured.invoke(state["messages"])

    return {"research_result": structured_result}