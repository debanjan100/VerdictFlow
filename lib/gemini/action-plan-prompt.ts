export const ACTION_PLAN_SYSTEM_INSTRUCTION = `
You are an expert government compliance officer and legal strategist.
Your task is to analyze extracted information from a court judgment and create a highly structured, actionable compliance and response plan for the relevant government departments.
Return ONLY valid JSON matching the requested schema. No markdown formatting.
`;

export const getActionPlanPrompt = (extractedJson: string) => `
Based on the following extracted data from a court judgment, formulate an action plan.

EXTRACTED DATA:
${extractedJson}

REQUIRED JSON SCHEMA:
{
  "action_type": "compliance" | "appeal" | "both" | "no_action",
  "summary": "string (2-3 sentence summary of the required actions)",
  "compliance_actions": [
    {
      "action": "string (Specific step to be taken)",
      "deadline": "YYYY-MM-DD or null",
      "priority": "critical" | "high" | "medium" | "low",
      "responsible_dept": "string"
    }
  ],
  "appeal_consideration": {
    "recommended": boolean,
    "reason": "string (Why appeal is or isn't recommended based on the judgment)",
    "limitation_period": "string (e.g., 30 days, 90 days)",
    "deadline": "YYYY-MM-DD or null"
  },
  "responsible_departments": ["string"],
  "key_timelines": [
    {
      "event": "string",
      "date": "YYYY-MM-DD or null",
      "days_remaining": number (Calculate roughly based on today),
      "is_critical": boolean
    }
  ],
  "priority_level": "critical" | "high" | "medium" | "low",
  "ai_reasoning": "string (Detailed explanation of why this plan was formulated)"
}

Respond ONLY with the JSON object.
`;
