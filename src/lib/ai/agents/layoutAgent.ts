import { runAgent } from "./base-agent";
import {
  layoutAgentOutputSchema,
  type LayoutAgentOutput,
  type AgentResult,
  type BriefAnalystOutput,
} from "@/types/agents";

/** System prompt for the Layout Agent */
const SYSTEM_PROMPT = `You are an email layout architect. Select the optimal section order for an email based on campaign type and audience.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation.
2. Choose from these section types: header, hero, features-3col, features-2col, body-text, social-proof, testimonial, cta, divider, ps-section, footer
3. Every email MUST include: header, hero or body-text, cta, footer
4. Keep layouts between 4-7 sections total
5. Match the layout to the campaign goal

Output format:
{
  "sections": ["header", "hero", "body-text", "cta", "footer"],
  "layoutNotes": "optional notes about the layout"
}`;

/** Run the Layout Agent — selects optimal email section structure */
export async function runLayoutAgent(
  brief: BriefAnalystOutput,
  campaignType: string
): Promise<AgentResult<LayoutAgentOutput>> {
  const userPrompt = `Select the optimal email layout for:

Campaign type: ${campaignType}
Tone: ${brief.tone}
Goal: ${brief.primaryGoal}
Audience: ${brief.audienceSegment}
Has key benefits: ${brief.keyBenefits.length > 2 ? "yes, multiple" : "focused"}

Return the layout as structured JSON.`;

  return runAgent({
    agentName: "LayoutAgent",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: layoutAgentOutputSchema,
    maxTokens: 300,
  });
}
