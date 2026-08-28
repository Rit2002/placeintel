from graph import prep_agent
from langchain_core.messages import HumanMessage

result = prep_agent.invoke({
    "messages": [HumanMessage(content=
        "Student ID: e4a0cf51-9075-4624-8ef1-bc789b8dfff9\n"
        "Company ID: ef40628b-a253-4512-a227-a95936640425\n"
        "Student's question: I have 2 months to prepare, help me build a roadmap."
    )]
})

print(result["messages"][-1].content)