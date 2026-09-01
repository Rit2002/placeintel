from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode, tools_condition
from state import AgentState
from agents import( 
    prep_agent_node, 
    prep_tools, 
    research_agent_node,
    format_research_output_node,
    research_tools,
    interview_question_node,
    interview_tools
)


# "ToolNode" is a ready-made node that knows how to look at a tool-call request from the LLM, find the matching Python function, call it, and format the result back into a message.

# tools_condition is a ready-made routing function that inspects the LLM's latest output and decides "does this need a tool call, or is it a final answer."

# ------------------------ Company Prep Agent ------------------------------

def build_prep_agent_graph():

    # Creates a graph
    graph = StateGraph(AgentState)

    # Adding nodes
    graph.add_node("agent", prep_agent_node)
    graph.add_node("tools", ToolNode(prep_tools))

    # Tells the graph "when someone calls .invoke(...), start execution at the "agent" node."
    graph.set_entry_point("agent")

    # After "agent" node finishes, the function "tools_condition" is invoked; if it's a plain text ( No tool call ), it routes to END
    # tools_condition is invoked after every single time the agent node produces output
    # Why contional_edge and not concrete? --> because we don't know whether to call tool or to generate a final response. So tools_condition does that for us.
    graph.add_conditional_edges("agent", tools_condition)

    # After tool runs, the response is routed back to agent which than decides what next step to take (tool call ot final response ).
    # This is the line that actually creates the loop
    graph.add_edge("tools", "agent")

    # .compile() validates the graph structure (nodes exist, edges reference real nodes, entry point is set) and turns the declarative graph definition into an actual runnable object with an .invoke(...) method — this is the object we actually call from outside this file.
    return graph.compile()


# ------------------------- Company Rearch Agent ---------------------------

def build_research_agent_graph():

    graph = StateGraph(AgentState)

    graph.add_node("agent",research_agent_node)
    graph.add_node("tools", ToolNode(research_tools))
    graph.add_node("format_output", format_research_output_node)

    graph.set_entry_point("agent")

    # If tools_condition returns END, route to format_output
    graph.add_conditional_edges("agent", tools_condition,
        {"tools" : "tools", END: "format_output"}) 

    graph.add_edge("tools", "agent")
    graph.add_edge("format_output", END)

    return graph.compile()



# ------------------------ Interview Agent Nodes ----------------------------

def build_interview_question_graph():

    graph = StateGraph(AgentState)

    graph.add_node("agent", interview_question_node)

    graph.add_node("tools", ToolNode(interview_tools))

    graph.set_entry_point("agent")

    # Inspects the llm's latest response and route either to tools or END
    graph.add_conditional_edges("agent", tools_condition)

    graph.add_edge("tools", "agent")

    return graph.compile()




def build_interview_evaluation_graph():

    graph = StateGraph(AgentState)

    graph.add_node("evaluate", interview_question_node)

    graph.set_entry_point("evaluate")
    graph.add_edge("evaluate", END)

    return graph.compile()










# ----------------------- Function Invokation ------------------------------

interview_question_agent = build_interview_question_graph()

interview_evaluation_agent = build_interview_evaluation_graph()

research_agent = build_research_agent_graph()

# This runs the builder function once, at module import time, and stores the compiled, ready-to-use graph in a module-level variable named prep_agent
prep_agent = build_prep_agent_graph()