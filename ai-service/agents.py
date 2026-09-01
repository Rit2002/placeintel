from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from config import get_llm
from state import AgentState
from tools import get_student_profile, get_drive_requirements, web_search
from models import CompanyResearchResponse

from prompts import PREP_AGENT_SYSTEM_PROMPT, COMPANY_RESEARCH_SYSTEM_PROMPT



prep_tools = [get_student_profile, get_drive_requirements, web_search]
prep_llm_with_tools = get_llm().bind_tools(prep_tools)

research_tools = [web_search]
research_llm_with_tools = get_llm().bind_tools(research_tools)
research_llm_structured = get_llm().with_structured_output(CompanyResearchResponse)




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

    structured_result = research_llm_structured.invoke([
        HumanMessage(
           content=f"""
            Based on the research gathered below, produce the final
            structured company research response.

            Research:
            {state["messages"]}
            """
        )
    ])

    return {"research_result": structured_result}




# ------------------------ Mock Interview Agent -------------------------------
from models import InterviewEvaluation

from prompts import INTERVIEW_QUESTION_SYSTEM_PROMPT, INTERVIEW_EVALUATION_SYSTEM_PROMPT

from message_utils import count_real_questions

interview_tools = [get_drive_requirements, web_search]

interview_llm_with_tools = get_llm().bind_tools(interview_tools)

interview_llm_structured = get_llm().with_structured_output(InterviewEvaluation)





def interview_question_node(state: AgentState):
    
    messages = state["messages"]

    


    question_number = count_real_questions(messages) + 1;

    # strip out any existing system message, then prepend a fresh one
    non_system_messages = [m for m in messages if not isinstance(m, SystemMessage)]

    system_prompt = INTERVIEW_QUESTION_SYSTEM_PROMPT.format(
        round_type=state["round_type"],
        company_id=state["company_id"],
        question_number=question_number,
    )

    # Creates a python list containing one element
    # SystemMessage() : creates a LangChain SystemMessage object
    full_messages = [SystemMessage(content=system_prompt)] + non_system_messages

    response = interview_llm_with_tools.invoke(full_messages)

    return {"messages": [response]}






def interview_evaluation_node(state: AgentState):

    messages = state["messages"]

    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=INTERVIEW_EVALUATION_SYSTEM_PROMPT)] + messages

    evaluation = interview_llm_structured.invoke(messages)
    return {"interview_evaluation": evaluation}