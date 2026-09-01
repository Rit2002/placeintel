from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from agents import extract_text


def deserialize_history(history: list[dict]) -> list:
    role_to_class = {
        "system": SystemMessage,
        "assistant": AIMessage,
        "human": HumanMessage,
        "tool": ToolMessage,
    }

    # here "m" represents one dictionary
    # role_to_class[m["role"]](content=m["content"]) == HumanMessage(content=m["content"])
    result = []
    for m in history:
        if m["role"] == "tool":
            result.append(ToolMessage(
                content=m["content"],
                tool_call_id=m.get("tool_call_id", "unknown"),
            ))
        else:
            result.append(role_to_class[m["role"]](content=m["content"]))

    return result






def serialize_history(messages: list) -> list[dict]:

    role_map = {
        SystemMessage: "system",
        AIMessage: "assistant",
        HumanMessage: "human",
        ToolMessage: "tool"
    }

    serialized = []

    for m in messages:
        entry = {"role": role_map[type(m)], "content": extract_text(m.content)}
        if isinstance(m, ToolMessage):
            entry["tool_call_id"] = m.tool_call_id
        serialized.append(entry)
        
    return serialized





def count_real_questions(messages: list) -> int:
    # question number = how many AI questions have already been asked, plus 1
    # counts how many AI messages in messages are actual interviewer responses rather than tool-calling messages.
    # This is a generator expression passed to Python's sum().
    return sum(
        1 for m in messages
        if isinstance(m, AIMessage) and not m.tool_calls and m.content
    )