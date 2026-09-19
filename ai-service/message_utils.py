from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from agents import extract_text


def deserialize_history(history: list[dict]) -> list:

    # here "m" represents one dictionary
    # role_to_class[m["role"]](content=m["content"]) == HumanMessage(content=m["content"])
    result = []
    for m in history:
        role = m["role"]

        if role == "tool":
            result.append(ToolMessage(
                content=m["content"],
                tool_call_id=m.get("tool_call_id", "unknown"),
                name=m.get("name", "unknown")
            ))
        elif role == "system":
            result.append(SystemMessage(content=m["content"]))
        
        elif role == "human":
            result.append(HumanMessage(content=m["content"]))

        elif role == "assistant": 
            tool_calls = m.get("tool_calls", [])
            result.append(AIMessage(
                content=m.get("content", ""),
                tool_calls=tool_calls
            ))

    return result






def serialize_history(messages: list) -> list[dict]:

   

    serialized = []

    for m in messages:
        
        if isinstance(m, SystemMessage):
            serialized.append({"role" : "system", "content" : extract_text(m.content)})
        
        elif isinstance(m, HumanMessage):
            serialized.append({"role" : "human", "content" : extract_text(m.content)})

        elif isinstance(m, ToolMessage):
            serialized.append({
                "role" : "tool",
                "content" : extract_text(m.content),
                "tool_call_id" : m.tool_call_id,
                "name" : getattr(m, "name", None) or "unknown_tool",
            })
        
        elif isinstance(m, AIMessage):
            entry = {"role" : "assistant", "content" : extract_text(m.content)}
            if m.tool_calls:
                entry["tool_calls"] = m.tool_calls
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