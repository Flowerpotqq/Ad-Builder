import { runAgent } from "./base-agent";
import { briefAnalystOutputSchema, type BriefAnalystOutput, type AgentResult } from "@/types/agents";

/** System prompt for the Brief Analyst agent */
const SYSTEM_PROMPT = `You are a marketing brief analyst. Your job is to take a raw campaign description and extract a structured intent object.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation, no code fences.
2. Extract the core meaning, not just repeat the input.
3. Identify the primary benefit for the audience.
4. Output must match this exact shape:
{
  "tone": "string — the emotional register (e.g., urgent, professional, friendly, bold)",
  "primaryGoal": "string — what the campaign aims to achieve",
  "audienceSegment": "string — who is being targeted",
  "ctaAction": "string — what action the reader should take",
  "keyBenefits": ["benefit1", "benefit2", "benefit3"]
}`;

/** Input for the Brief Analyst agent */
export interface BriefAnalystInput {
  goal: string;
  audience: string;
  keyMessage: string;
  ctaText: string;
  additionalNotes?: string;
}

/** Run the Brief Analyst agent — extracts structured intent from a raw brief */
export async function runBriefAnalyst(input: BriefAnalystInput): Promise<AgentResult<BriefAnalystOutput>> {
  const userPrompt = `Analyze this campaign brief and return a structured JSON object:

Goal: ${input.goal}
Target audience: ${input.audience}
Key message: ${input.keyMessage}
CTA text: ${input.ctaText}
${input.additionalNotes ? `Additional notes: ${input.additionalNotes}` : ""}`;

  return runAgent({
    agentName: "BriefAnalyst",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: briefAnalystOutputSchema,
    maxTokens: 300,
  });
}
