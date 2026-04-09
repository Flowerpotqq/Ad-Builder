import type { GenerateEmailRequest, RefineEmailRequest } from "@/types";

/**
 * Build the user prompt for email generation.
 * Combines the campaign brief with the serialized brand profile and optional
 * email-agent markdown context.
 */
export function buildGenerationPrompt(
  brief: GenerateEmailRequest,
  brandContext: string,
  emailAgentContext?: string
): string {
  return `${emailAgentContext ? `${emailAgentContext}\n\n` : ""}${brandContext}

CAMPAIGN BRIEF:
----------------------
Goal: ${brief.goal}
Target audience: ${brief.audience}
Key message: ${brief.keyMessage}
CTA text: ${brief.ctaText}
${brief.tone ? `Desired tone: ${brief.tone}` : ""}
${brief.additionalNotes ? `Additional notes: ${brief.additionalNotes}` : ""}
----------------------

Generate a complete, production-ready HTML email following all the rules in your system prompt. Apply the brand profile exactly as specified.`;
}

/**
 * Build the user prompt for email refinement.
 * Sends the existing HTML with the modification instruction.
 */
export function buildRefinementPrompt(request: RefineEmailRequest): string {
  const sectionNote = request.section
    ? `Focus your changes on the ${request.section} section.`
    : "Apply the change wherever appropriate.";

  return `Here is the current email HTML:

${request.htmlContent}

INSTRUCTION: ${request.instruction}
${sectionNote}

Return the complete modified HTML email with the requested changes applied. Preserve all other sections exactly as they are.`;
}

/**
 * Build the user prompt for subject line suggestions.
 */
export function buildSubjectLinePrompt(
  htmlContent: string,
  brandContext: string,
  emailAgentContext?: string
): string {
  return `${emailAgentContext ? `${emailAgentContext}\n\n` : ""}${brandContext}

Here is the email content:

${htmlContent}

Based on this email content and the brand profile, suggest 5 compelling subject lines. Return them as a JSON array with "subject" and "reasoning" keys.`;
}
