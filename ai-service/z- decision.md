1) Design decision for mock interview agent : 
    - Student picks company/drive + round type (Technical, HR, etc.)

    - Agent fetches drive requirements + searches web for real, company-specific questions for that round type

    - Fixed 5 questions, one at a time, multi-turn (frontend holds conversation history, resends full history each turn)

   - Consolidated structured evaluation at the end,     after question 5


2) round_type: Optional[str] & company_id: Optional[str] Why this are optional?

    AgentState is shared across all three agents — remember, state.py holds one TypedDict used by Prep Agent, Research Agent, and Mock Interview Agent's graphs. Prep Agent and Research Agent never set round_type/company_id at all — those fields are meaningless to them.