# from graph import prep_agent
# from langchain_core.messages import HumanMessage

# result = prep_agent.invoke({
#     "messages": [HumanMessage(content=
#         "Student ID: e4a0cf51-9075-4624-8ef1-bc789b8dfff9\n"
#         "Company ID: ef40628b-a253-4512-a227-a95936640425\n"
#         "Student's question: I have 2 months to prepare, help me build a roadmap."
#     )]
# })

# print(result["messages"][-1].content)


# if __name__ == "__main__":
#     from graph import research_agent
#     from langchain_core.messages import HumanMessage

#     result = research_agent.invoke({
#         "messages": [HumanMessage(content="Research the company: Barclays for role : Software Engineer / Developer")]
#     })

#     print(result["research_result"])


from prompts import INTERVIEW_QUESTION_SYSTEM_PROMPT
from graph import interview_question_agent


if __name__ == "__main__":
    from langchain_core.messages import HumanMessage

    result = interview_question_agent.invoke({
        "messages": [
            HumanMessage(content="Begin the interview.")
        ],
        "round_type": "TECHNICAL",
        "company_id": "ef40628b-a253-4512-a227-a95936640425",
        "question_number": 1,
    })

    print(result["messages"][-1].content)