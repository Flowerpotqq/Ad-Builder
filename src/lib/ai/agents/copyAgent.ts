import { runAgent } from "./base-agent";
import {
  copyAgentOutputSchema,
  type CopyAgentOutput,
  type AgentResult,
  type BriefAnalystOutput,
} from "@/types/agents";

/** System prompt for the Copy Agent */
const SYSTEM_PROMPT = `You are an expert email copywriter. Write compelling, conversion-focused email body copy.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation, no code fences.
2. Write plain text only — NO HTML, NO CSS, NO formatting tags.
3. headline: bold, attention-grabbing, under 10 words
4. subheadline: supports the headline, adds context, under 20 words
5. body: 2-3 short paragraphs, benefit-focused, conversational, under 150 words total
6. ctaText: action-oriented button text, 2-5 words
7. ps: optional but recommended postscript that adds urgency or social proof

Output format:
{
  "headline": "...",
  "subheadline": "...",
  "body": "...",
  "ctaText": "...",
  "ps": "..."
}`;

/** Run the Copy Agent — writes email body copy in structured JSON */
export async function runCopyAgent(
  brief: BriefAnalystOutput,
  brandVoice: string
): Promise<AgentResult<CopyAgentOutput>> {
  const userPrompt = `Write email copy for this campaign:

Tone: ${brief.tone}
Goal: ${brief.primaryGoal}
Audience: ${brief.audienceSegment}
CTA action: ${brief.ctaAction}
Key benefits: ${brief.keyBenefits.join(", ")}
Brand voice: ${brandVoice}

Return the copy as structured JSON.`;

  return runAgent({
    agentName: "CopyAgent",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: copyAgentOutputSchema,
    maxTokens: 700,
  });
}
