import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { runCopyAgent } from "@/lib/ai/agents/copyAgent";
import { runSubjectLineAgent } from "@/lib/ai/agents/subjectLineAgent";
import { runLayoutAgent } from "@/lib/ai/agents/layoutAgent";
import { runHtmlAssemblyAgent } from "@/lib/ai/agents/htmlAssemblyAgent";
import { buildEmailAgentContextBundle } from "@/lib/ai/email-agent-loader";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";
import { isRateLimited } from "@/lib/rate-limit";
import type { BriefAnalystOutput, CopyAgentOutput, LayoutAgentOutput } from "@/types/agents";

const regenerateSchema = z.object({
  sectionName: z.enum(["copy", "subject", "layout"]),
  briefData: z.object({
    tone: z.string(),
    primaryGoal: z.string(),
    audienceSegment: z.string(),
    ctaAction: z.string(),
    keyBenefits: z.array(z.string()),
  }),
  existingCopy: z.object({
    headline: z.string(),
    subheadline: z.string(),
    body: z.string(),
    ctaText: z.string(),
    ps: z.string().optional(),
  }).optional(),
  existingLayout: z.object({
    sections: z.array(z.string()),
    layoutNotes: z.string().optional(),
  }).optional(),
  campaignType: z.string().optional().default("PROMOTIONAL"),
});

/** POST /api/ai/regenerate-section — Re-run only a specific agent in the pipeline */
export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    if (isRateLimited(userId)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = regenerateSchema.safeParse(body);
    if (!parsed.success) return badRequestResponse(parsed.error.errors[0].message);

    const { sectionName, briefData, existingCopy, existingLayout, campaignType } = parsed.data;
    const brandProfile = await prisma.brandProfile.findUnique({ where: { userId } });
    if (!brandProfile) return badRequestResponse("No brand profile found");
    const emailAgentBundle = await buildEmailAgentContextBundle({
      campaignType,
      goal: briefData.primaryGoal,
      keyMessage: briefData.keyBenefits.join(", "),
    });

    let result: unknown;

    switch (sectionName) {
      case "copy": {
        const copyResult = await runCopyAgent(
          briefData as BriefAnalystOutput,
          brandProfile.brandVoice,
          emailAgentBundle.copyContext
        );
        result = copyResult;
        break;
      }
      case "subject": {
        const subjectResult = await runSubjectLineAgent(
          briefData as BriefAnalystOutput,
          emailAgentBundle.subjectContext
        );
        result = subjectResult;
        break;
      }
      case "layout": {
        const layoutResult = await runLayoutAgent(
          briefData as BriefAnalystOutput,
          campaignType,
          emailAgentBundle.layoutContext
        );
        // If we have existing copy, also re-assemble HTML
        if (existingCopy) {
          const htmlResult = await runHtmlAssemblyAgent(
            existingCopy as CopyAgentOutput,
            layoutResult.data,
            {
              primaryColor: brandProfile.primaryColor,
              secondaryColor: brandProfile.secondaryColor,
              accentColor: brandProfile.accentColor,
              backgroundColor: brandProfile.backgroundColor,
              textColor: brandProfile.textColor,
              fontFamily: brandProfile.fontFamily,
              fontSizeBase: brandProfile.fontSizeBase,
              logoUrl: brandProfile.logoUrl,
              siteUrl: brandProfile.siteUrl,
              ctaStyle: brandProfile.ctaStyle,
            },
            emailAgentBundle.htmlContext
          );
          result = { layout: layoutResult, html: htmlResult };
        } else {
          result = layoutResult;
        }
        break;
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Regenerate section error:", error);
    return serverErrorResponse("Failed to regenerate section");
  }
}
