import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { callClaude } from "@/lib/ai/claude-client";
import { SUBJECT_LINE_PROMPT } from "@/lib/ai/system-prompt";
import { serializeBrandProfile } from "@/lib/ai/brand-serializer";
import { buildSubjectLinePrompt } from "@/lib/ai/prompt-builder";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";
import { isRateLimited } from "@/lib/rate-limit";

const suggestSchema = z.object({
  htmlContent: z.string().min(1, "Email HTML content is required"),
});

/** POST /api/ai/suggest-subjects — Get AI-generated subject line suggestions */
export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = suggestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId },
    });

    if (!brandProfile) {
      return badRequestResponse("No brand profile found.");
    }

    const brandContext = serializeBrandProfile(brandProfile);
    const userPrompt = buildSubjectLinePrompt(parsed.data.htmlContent, brandContext);
    const response = await callClaude(SUBJECT_LINE_PROMPT, userPrompt, 1024);

    // Parse the JSON response
    try {
      const suggestions = JSON.parse(response);
      return NextResponse.json({ success: true, data: { suggestions } });
    } catch {
      // If parsing fails, return the raw response
      return NextResponse.json({
        success: true,
        data: { suggestions: [{ subject: response, reasoning: "AI-generated" }] },
      });
    }
  } catch (error) {
    console.error("Subject suggestion error:", error);
    return serverErrorResponse("Failed to generate subject lines.");
  }
}
