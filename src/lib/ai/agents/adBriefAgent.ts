import { runAgent } from "./base-agent";
import { adBriefAgentOutputSchema, type AdBriefAgentOutput, type AgentResult } from "@/types/agents";

/** System prompt for the Ad Brief Agent */
const SYSTEM_PROMPT = `You are a social media advertising strategist. Analyze a user's ad description and extract a structured ad brief.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation.
2. Infer the platform (facebook or tiktok) from context if not stated.
3. Choose the best visual type based on the message.
4. Keep headline under 40 characters, subtext under 80 characters.

Visual types:
- stat: large number or metric + context (e.g., "24/7 AI coverage")
- service: feature highlight with icon concept
- testimonial: quote card
- promo: offer/discount with urgency
- comparison: before/after or problem/solution
- highlight: key benefit focused

Format options:
- Facebook: square (1080x1080), story (1080x1920), carousel (1080x1080)
- TikTok: vertical (1080x1920), spark (lower-third card)

Output format:
{
  "platform": "facebook",
  "format": "square",
  "visualType": "stat",
  "headline": "...",
  "subtext": "...",
  "ctaText": "...",
  "statOrProof": "...",
  "targetAudience": "...",
  "urgencyLine": "...",
  "brandTone": "..."
}`;

export interface AdBriefInput {
  description: string;
  platform?: string;
  format?: string;
  visualType?: string;
}

/** Run the Ad Brief Agent — extracts structured ad brief from a description */
export async function runAdBriefAgent(input: AdBriefInput): Promise<AgentResult<AdBriefAgentOutput>> {
  const userPrompt = `Analyze this ad request and return a structured brief:

Description: ${input.description}
${input.platform ? `Preferred platform: ${input.platform}` : ""}
${input.format ? `Preferred format: ${input.format}` : ""}
${input.visualType ? `Preferred visual type: ${input.visualType}` : ""}`;

  return runAgent({
    agentName: "AdBriefAgent",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: adBriefAgentOutputSchema,
    maxTokens: 400,
  });
}
