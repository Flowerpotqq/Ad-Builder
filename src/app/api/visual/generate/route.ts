import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { runVisualPipeline } from "@/lib/ai/visual-pipeline";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";
import { isRateLimited } from "@/lib/rate-limit";

const generateSchema = z.object({
  description: z.string().min(1, "Ad description is required"),
  platform: z.enum(["facebook", "tiktok"]).optional(),
  format: z.string().optional(),
  visualType: z.string().optional(),
});

/** POST /api/visual/generate — Run the visual content pipeline */
export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    if (isRateLimited(userId)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) return badRequestResponse(parsed.error.errors[0].message);

    const brandProfile = await prisma.brandProfile.findUnique({ where: { userId } });
    if (!brandProfile) return badRequestResponse("No brand profile found");

    const result = await runVisualPipeline(parsed.data, brandProfile);

    return NextResponse.json({
      success: true,
      data: {
        brief: result.brief.data,
        copy: result.copy.data,
        layout: result.layout.data,
        totalTokens: result.totalTokens,
        totalDurationMs: result.totalDurationMs,
      },
    });
  } catch (error) {
    console.error("Visual generate error:", error);
    return serverErrorResponse("Failed to generate ad content");
  }
}
