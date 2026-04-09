import { runAgent } from "./base-agent";
import { adLayoutAgentOutputSchema, type AdLayoutAgentOutput, type AgentResult, type AdBriefAgentOutput } from "@/types/agents";

/** System prompt for the Ad Layout Selector Agent */
const SYSTEM_PROMPT = `You are a visual design strategist for social media ads. Select the optimal layout template, color scheme, and styling for an ad.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation.
2. template: must be one of: StatCard, ServiceCard, TestimonialCard, PromoCard, ProblemSolution, BeforeAfter
3. colorScheme: provide hex colors that work well together and match the brand
4. iconStyle: one of: outline, filled, gradient, minimal
5. layoutVariant: one of: centered, left-aligned, split, overlay

Output format:
{
  "template": "StatCard",
  "colorScheme": {
    "background": "#0e0e2c",
    "text": "#ffffff",
    "accent": "#b8dff0",
    "cta": "#ffffff"
  },
  "iconStyle": "outline",
  "layoutVariant": "centered"
}`;

/** Run the Ad Layout Agent — selects template, colors, and styling */
export async function runAdLayoutAgent(
  brief: AdBriefAgentOutput,
  brandColors: { primary: string; accent: string; background: string }
): Promise<AgentResult<AdLayoutAgentOutput>> {
  const userPrompt = `Select the best layout for this ad:

Platform: ${brief.platform}
Format: ${brief.format}
Visual type: ${brief.visualType}
Tone: ${brief.brandTone}

Brand colors: primary ${brandColors.primary}, accent ${brandColors.accent}, background ${brandColors.background}

Return the layout selection as JSON.`;

  return runAgent({
    agentName: "AdLayoutAgent",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: adLayoutAgentOutputSchema,
    maxTokens: 300,
  });
}
