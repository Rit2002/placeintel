1) Why the Company research agent is in two phases?
ans :  Gemini (like most models) can't reliably do tool-calling and strict structured-output in the exact same call — so this agent needs two phases: first, a normal tool-calling loop to gather research (same ReAct pattern as Prep Agent), then a second, final step that takes everything gathered and asks the model to format it into the exact

2) llm_with_tools = get_llm().bind_tools(tools)?
ans :Every call to get_llm() constructs a brand new, independent ChatGoogleGenerativeAI object. So prep_llm_with_tools, research_llm_with_tools, and research_llm_structured are each built from their own separate instance — there's no shared mutable object between them at all

3) Optional[CompanyResearchResponse] is Python's way of saying "this field is either a CompanyResearchResponse, or it's None