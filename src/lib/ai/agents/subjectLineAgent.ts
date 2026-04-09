import { runAgent } from "./base-agent";
import {
  subjectLineAgentOutputSchema,
  type SubjectLineAgentOutput,
  type AgentResult,
  type BriefAnalystOutput,
} from "@/types/agents";

/** System prompt for the Subject Line agent */
const SYSTEM_PROMPT = `You are an email subject line specialist. Generate compelling subject lines that maximize open rates.

RULES:
1. Return ONLY a valid JSON array - no markdown, no explanation, no code fences.
2. Each subject line must be under 60 characters.
3. Each preview text must be under 90 characters.
4. Avoid spam triggers: free, guaranteed, act now, limited time, click here.
5. Use proven techniques: curiosity gaps, numbers, personalization, benefits.
6. Return exactly 5 options.

Output format:
[
  { "subject": "...", "previewText": "...", "tone": "..." },
  ...
]`;

/** Run the Subject Line agent and generate 5 subject/preview pairs */
export async function runSubjectLineAgent(
  brief: BriefAnalystOutput,
  emailAgentContext?: string
): Promise<AgentResult<SubjectLineAgentOutput>> {
  const userPrompt = `${emailAgentContext ? `EMAIL_AGENT_CONTEXT:\n${emailAgentContext}\n\n` : ""}Generate 5 subject lines with preview text for this campaign:

Tone: ${brief.tone}
Goal: ${brief.primaryGoal}
Audience: ${brief.audienceSegment}
CTA: ${brief.ctaAction}
Key benefits: ${brief.keyBenefits.join(", ")}`;

  return runAgent({
    agentName: "SubjectLineAgent",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: subjectLineAgentOutputSchema,
    maxTokens: 500,
  });
}
