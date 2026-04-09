import type { BrandProfile } from "@prisma/client";

/** Voice label mapping for human-readable prompt injection */
const voiceLabels: Record<string, string> = {
  PROFESSIONAL: "Professional, polished, authoritative",
  CASUAL: "Casual, friendly, approachable",
  SALES_FOCUSED: "Sales-focused, direct, persuasive, tech-forward",
  TECHNICAL: "Technical, precise, data-driven",
};

/**
 * Serialize a BrandProfile into a structured context block for Claude prompts.
 * This string is prepended to every AI generation call.
 */
export function serializeBrandProfile(profile: BrandProfile): string {
  return `
BRAND PROFILE:
━━━━━━━━━━━━━━━━━━━━━━
Primary color: ${profile.primaryColor}
Secondary color: ${profile.secondaryColor}
Accent color: ${profile.accentColor}
Background color: ${profile.backgroundColor}
Text color: ${profile.textColor}
Font family: ${profile.fontFamily}
Font size base: ${profile.fontSizeBase}px
Logo URL: ${profile.logoUrl || "Not provided — use brand name in styled text instead"}
Website: ${profile.siteUrl}
Brand voice: ${voiceLabels[profile.brandVoice] || profile.brandVoice}
CTA button style: ${profile.ctaStyle}
${profile.customNotes ? `Additional brand notes: ${profile.customNotes}` : ""}
━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}
