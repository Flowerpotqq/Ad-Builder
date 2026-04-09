import { runAgent } from "./base-agent";
import { qaAgentOutputSchema, type QaAgentOutput, type AgentResult } from "@/types/agents";

/** System prompt for the QA Agent */
const SYSTEM_PROMPT = `You are an email quality assurance specialist. Review the provided HTML email and return a structured audit report.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation.
2. Be specific in your findings — cite exact elements or text.
3. Score from 1-10 (10 = excellent).
4. Spam triggers: check subject line hints in the copy, common trigger words.
5. Mobile issues: check for fixed widths over 600px, small fonts, unclickable CTAs.
6. Brand consistency: check if colors/fonts match the profile.

Output format:
{
  "spamTriggers": ["list of spam trigger words or patterns found"],
  "mobileIssues": ["list of mobile rendering concerns"],
  "ctaClarity": 8,
  "brandConsistency": 9,
  "suggestedFixes": ["actionable fix 1", "actionable fix 2"],
  "overallScore": 8
}`;

/** Run the QA Agent — reviews assembled HTML and returns an audit report */
export async function runQaAgent(html: string): Promise<AgentResult<QaAgentOutput>> {
  const userPrompt = `Review this email HTML and return a quality audit report:

${html}`;

  return runAgent({
    agentName: "QaAgent",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: qaAgentOutputSchema,
    maxTokens: 600,
  });
}
