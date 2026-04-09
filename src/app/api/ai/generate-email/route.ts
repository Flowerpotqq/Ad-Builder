import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { callClaude } from "@/lib/ai/claude-client";
import { EMAIL_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { serializeBrandProfile } from "@/lib/ai/brand-serializer";
import { buildGenerationPrompt } from "@/lib/ai/prompt-builder";
import { buildEmailAgentContextBundle } from "@/lib/ai/email-agent-loader";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";
import { isRateLimited } from "@/lib/rate-limit";

/** Validation schema for email generation requests */
const generateSchema = z.object({
  goal: z.string().min(1, "Campaign goal is required"),
  audience: z.string().min(1, "Target audience is required"),
  keyMessage: z.string().min(1, "Key message is required"),
  ctaText: z.string().min(1, "CTA text is required"),
  tone: z.string().optional(),
  additionalNotes: z.string().optional(),
  emailType: z.string().optional(),
  campaignType: z.string().optional(),
});

/** POST /api/ai/generate-email — Generate a brand-consistent HTML email via Claude */
export async function POST(req: Request) {
  try {
    // Auth check
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    // Rate limit check
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    // Validate input
    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    // Fetch brand profile
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId },
    });

    if (!brandProfile) {
      return badRequestResponse(
        "No brand profile found. Please set up your brand profile first."
      );
    }

    // Build prompt and call Claude
    const brandContext = serializeBrandProfile(brandProfile);
    const emailAgentBundle = await buildEmailAgentContextBundle({
      emailType: parsed.data.emailType,
      campaignType: parsed.data.campaignType,
      goal: parsed.data.goal,
      keyMessage: parsed.data.keyMessage,
      additionalNotes: parsed.data.additionalNotes,
    });

    const userPrompt = buildGenerationPrompt(
      parsed.data,
      brandContext,
      emailAgentBundle.fullContext
    );

    const htmlContent = await callClaude(EMAIL_SYSTEM_PROMPT, userPrompt);

    return NextResponse.json({
      success: true,
      data: { htmlContent, promptSelection: emailAgentBundle.selection },
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return serverErrorResponse(
      "Failed to generate email. Please try again."
    );
  }
}
