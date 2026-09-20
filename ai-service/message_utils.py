from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
    AIMessage,
    ToolMessage,
)


# ============================================================
# TEXT EXTRACTION
# ============================================================

def extract_text(content) -> str:
    """
    Convert LangChain message content into plain text.

    Handles:
    - str
    - list of content blocks
    - dictionaries containing text
    - other objects
    """

    if isinstance(content, str):
        return content

    if isinstance(content, list):

        parts = []

        for block in content:

            if isinstance(block, dict):

                if "text" in block:
                    parts.append(
                        str(block["text"])
                    )

            elif isinstance(block, str):

                parts.append(block)

        return "".join(parts)

    return str(content)


# ============================================================
# HISTORY DESERIALIZATION
# ============================================================

def deserialize_history(
    history: list[dict]
) -> list:

    result = []

    for message in history:

        role = message.get("role")

        if role == "tool":

            result.append(
                ToolMessage(
                    content=message.get(
                        "content",
                        ""
                    ),
                    tool_call_id=message.get(
                        "tool_call_id",
                        "unknown"
                    ),
                    name=message.get(
                        "name",
                        "unknown"
                    ),
                )
            )

        elif role == "system":

            result.append(
                SystemMessage(
                    content=message.get(
                        "content",
                        ""
                    )
                )
            )

        elif role == "human":

            result.append(
                HumanMessage(
                    content=message.get(
                        "content",
                        ""
                    )
                )
            )

        elif role == "assistant":

            tool_calls = message.get(
                "tool_calls",
                []
            )

            result.append(
                AIMessage(
                    content=message.get(
                        "content",
                        ""
                    ),
                    tool_calls=tool_calls,
                )
            )

    return result


# ============================================================
# HISTORY SERIALIZATION
# ============================================================

def serialize_history(
    messages: list
) -> list[dict]:

    serialized = []

    for message in messages:

        if isinstance(
            message,
            SystemMessage
        ):

            serialized.append(
                {
                    "role": "system",
                    "content": extract_text(
                        message.content
                    ),
                }
            )

        elif isinstance(
            message,
            HumanMessage
        ):

            serialized.append(
                {
                    "role": "human",
                    "content": extract_text(
                        message.content
                    ),
                }
            )

        elif isinstance(
            message,
            ToolMessage
        ):

            serialized.append(
                {
                    "role": "tool",
                    "content": extract_text(
                        message.content
                    ),
                    "tool_call_id": (
                        message.tool_call_id
                    ),
                    "name": (
                        getattr(
                            message,
                            "name",
                            None
                        )
                        or "unknown_tool"
                    ),
                }
            )

        elif isinstance(
            message,
            AIMessage
        ):

            entry = {
                "role": "assistant",
                "content": extract_text(
                    message.content
                ),
            }

            if message.tool_calls:

                entry["tool_calls"] = (
                    message.tool_calls
                )

            serialized.append(entry)

    return serialized


# ============================================================
# INTERVIEW QUESTION COUNT
# ============================================================

def count_real_questions(
    messages: list
) -> int:
    """
    Count actual interviewer questions.

    AI messages containing tool calls are not counted because
    they are tool requests rather than interview questions.
    """

    return sum(
        1
        for message in messages
        if (
            isinstance(
                message,
                AIMessage
            )
            and not message.tool_calls
            and bool(
                extract_text(
                    message.content
                ).strip()
            )
        )
    )