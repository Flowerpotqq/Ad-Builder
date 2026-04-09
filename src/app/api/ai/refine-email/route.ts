import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaude } from "@/lib/ai/claude-client";
import { REFINE_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { buildRefinementPrompt } from "@/lib/ai/prompt-builder";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";
import { isRateLimited } from "@/lib/rate-limit";

/** Validation schema for email refinement requests */
const refineSchema = z.object({
  htmlContent: z.string().min(1, "HTML content is required"),
  instruction: z.string().min(1, "Refinement instruction is required"),
  section: z.string().optional(),
});

/** POST /api/ai/refine-email — Refine/optimize an existing HTML email via Claude */
export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = refineSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const userPrompt = buildRefinementPrompt(parsed.data);
    const htmlContent = await callClaude(REFINE_SYSTEM_PROMPT, userPrompt);

    return NextResponse.json({
      success: true,
      data: { htmlContent },
    });
  } catch (error) {
    console.error("Email refinement error:", error);
    return serverErrorResponse("Failed to refine email. Please try again.");
  }
}
