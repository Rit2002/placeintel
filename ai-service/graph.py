from langgraph.graph import (
    StateGraph,
    END,
)

from langgraph.prebuilt import (
    ToolNode,
    tools_condition,
)

from state import AgentState

from agents import (
    prep_agent_node,
    prep_tools,
    research_agent_node,
    format_research_output_node,
    research_tools,
    interview_question_node,
    interview_tools,
    interview_evaluation_node,
)


# ============================================================
# PREPARATION AGENT
# ============================================================

def build_prep_agent_graph():

    graph = StateGraph(
        AgentState
    )

    graph.add_node(
        "agent",
        prep_agent_node
    )

    graph.add_node(
        "tools",
        ToolNode(prep_tools)
    )

    graph.set_entry_point(
        "agent"
    )

    graph.add_conditional_edges(
        "agent",
        tools_condition
    )

    graph.add_edge(
        "tools",
        "agent"
    )

    return graph.compile()


# ============================================================
# COMPANY RESEARCH AGENT
# ============================================================

def build_research_agent_graph():

    graph = StateGraph(
        AgentState
    )

    graph.add_node(
        "agent",
        research_agent_node
    )

    graph.add_node(
        "tools",
        ToolNode(research_tools)
    )

    graph.add_node(
        "format_output",
        format_research_output_node
    )

    graph.set_entry_point(
        "agent"
    )

    graph.add_conditional_edges(
        "agent",
        tools_condition,
        {
            "tools": "tools",
            END: "format_output",
        },
    )

    graph.add_edge(
        "tools",
        "agent"
    )

    graph.add_edge(
        "format_output",
        END
    )

    return graph.compile()


# ============================================================
# INTERVIEW QUESTION AGENT
# ============================================================

def build_interview_question_graph():

    graph = StateGraph(
        AgentState
    )

    graph.add_node(
        "agent",
        interview_question_node
    )

    graph.add_node(
        "tools",
        ToolNode(interview_tools)
    )

    graph.set_entry_point(
        "agent"
    )

    graph.add_conditional_edges(
        "agent",
        tools_condition
    )

    graph.add_edge(
        "tools",
        "agent"
    )

    return graph.compile()


# ============================================================
# INTERVIEW EVALUATION AGENT
# ============================================================

def build_interview_evaluation_graph():

    graph = StateGraph(
        AgentState
    )

    graph.add_node(
        "evaluate",
        interview_evaluation_node
    )

    graph.set_entry_point(
        "evaluate"
    )

    graph.add_edge(
        "evaluate",
        END
    )

    return graph.compile()


# ============================================================
# COMPILED GRAPHS
# ============================================================

interview_question_agent = (
    build_interview_question_graph()
)

interview_evaluation_agent = (
    build_interview_evaluation_graph()
)

research_agent = (
    build_research_agent_graph()
)

prep_agent = (
    build_prep_agent_graph()
)