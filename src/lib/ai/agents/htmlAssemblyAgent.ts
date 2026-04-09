import { runAgent } from "./base-agent";
import { z } from "zod";
import type { AgentResult, CopyAgentOutput, LayoutAgentOutput } from "@/types/agents";

/** System prompt for the HTML Assembly Agent */
const SYSTEM_PROMPT = `You are an email HTML assembler. You receive structured copy, a layout plan, and a brand profile. Your job is to assemble a complete, email-client-safe HTML email.

CRITICAL RULES:
1. Return ONLY the complete HTML document - starting with <!DOCTYPE html> and ending with </html>.
2. Use ONLY inline CSS (style="...") - NO <style> blocks, NO external CSS.
3. Use table-based layout for Outlook compatibility.
4. Maximum width: 600px, centered.
5. DO NOT invent new copy - use EXACTLY the text from the copy JSON provided.
6. Include the brand colors, fonts, and styles as specified.
7. Include {{firstName}} merge tag in the greeting.
8. Include {{unsubscribeUrl}} in the footer.

CTA BUTTON PATTERN:
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
  <tr>
    <td style="border-radius: 8px; background-color: [BRAND_PRIMARY];">
      <a href="#" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none;">
        [CTA TEXT]
      </a>
    </td>
  </tr>
</table>`;

/** Run the HTML Assembly Agent and assemble final email HTML from components */
export async function runHtmlAssemblyAgent(
  copy: CopyAgentOutput,
  layout: LayoutAgentOutput,
  brandProfile: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSizeBase: number;
    logoUrl: string | null;
    siteUrl: string;
    ctaStyle: string;
  },
  emailAgentContext?: string
): Promise<AgentResult<string>> {
  const userPrompt = `${emailAgentContext ? `EMAIL_AGENT_CONTEXT:\n${emailAgentContext}\n\n` : ""}Assemble a complete HTML email using these components:

COPY:
${JSON.stringify(copy, null, 2)}

LAYOUT SECTIONS:
${JSON.stringify(layout.sections)}

BRAND PROFILE:
Primary color: ${brandProfile.primaryColor}
Secondary color: ${brandProfile.secondaryColor}
Accent color: ${brandProfile.accentColor}
Background: ${brandProfile.backgroundColor}
Text color: ${brandProfile.textColor}
Font: ${brandProfile.fontFamily}
Font size: ${brandProfile.fontSizeBase}px
Logo URL: ${brandProfile.logoUrl || "Use brand name in text"}
Website: ${brandProfile.siteUrl}
CTA style: ${brandProfile.ctaStyle}

Return the complete HTML email document.`;

  return runAgent({
    agentName: "HtmlAssemblyAgent",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    outputSchema: z.string(),
    maxTokens: 2048,
    parseAsHtml: true,
  });
}
