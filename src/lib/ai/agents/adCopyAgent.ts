import { runAgent } from "./base-agent";
import { adCopyAgentOutputSchema, type AdCopyAgentOutput, type AgentResult, type AdBriefAgentOutput } from "@/types/agents";

/** System prompt for the Ad Copy Refinement Agent */
const SYSTEM_PROMPT = `You are a social media copywriter specializing in paid ads. Refine ad copy for a specific platform.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation.
2. Platform-specific optimization:
   - Facebook: benefit-led, curiosity hooks, conversational, headline under 40 chars
   - TikTok: punchy, pattern-interrupt, scroll-stopping first line, headline under 30 chars
3. All text must be concise — every word earns its place.
4. CTA text: 2-4 words, action-oriented.
5. Hook: the opening line that stops the scroll (especially for TikTok).
6. Urgency line: creates FOMO without being spammy.

Output format:
{
  "headline": "...",
  "subtext": "...",
  "ctaText": "...",
  "hook": "...",
  "urgencyLine": "..."
}`;

/** Run the Ad Copy Agent — refines copy for platform-specific optimization */
export async function runAdCopyAgent(
  brief: AdBriefAgentOutput,
  brandVoice: string
): Promise<AgentResult<AdCopyAgentOutput>> {
  const userPrompt = `Refine this ad copy for ${brief.platform}:

Headline: ${brief.headline}
Subtext: ${brief.subtext}
CTA: ${brief.ctaText}
Target: ${brief.targetAudience}
Brand tone: ${brief.brandTone}
Brand voice: ${brandVoice}
Visual type: ${brief.visualType}

Return platform-optimized copy as JSON.`;

  return runAgent({
    agentName: "AdCopyAgent",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: adCopyAgentOutputSchema,
    maxTokens: 400,
  });
}
