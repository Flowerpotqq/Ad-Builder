import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { runEmailPipeline } from "@/lib/ai/pipeline";
import { getAuthenticatedSession } from "@/lib/auth-helpers";
import { isRateLimited } from "@/lib/rate-limit";

/** Validation schema for the v2 generation request */
const generateV2Schema = z.object({
  goal: z.string().min(1),
  audience: z.string().min(1),
  keyMessage: z.string().min(1),
  ctaText: z.string().min(1),
  additionalNotes: z.string().optional(),
  campaignType: z.string().optional().default("PROMOTIONAL"),
});

/**
 * POST /api/ai/generate-email-v2 — Subagent pipeline with SSE progress streaming.
 * Returns Server-Sent Events with stage updates, then the final result.
 */
export async function POST(req: Request) {
  const session = await getAuthenticatedSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  if (isRateLimited(userId)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 });
  }

  const body = await req.json();
  const parsed = generateV2Schema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.errors[0].message }), { status: 400 });
  }

  const brandProfile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!brandProfile) {
    return new Response(JSON.stringify({ error: "No brand profile found" }), { status: 400 });
  }

  // Set up SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runEmailPipeline(
          {
            goal: parsed.data.goal,
            audience: parsed.data.audience,
            keyMessage: parsed.data.keyMessage,
            ctaText: parsed.data.ctaText,
            additionalNotes: parsed.data.additionalNotes,
          },
          brandProfile,
          parsed.data.campaignType,
          (stage, progress) => {
            const event = `data: ${JSON.stringify({ stage, progress })}\n\n`;
            controller.enqueue(encoder.encode(event));
          }
        );

        // Send final result
        const finalEvent = `data: ${JSON.stringify({
          stage: "complete",
          progress: 100,
          result: {
            html: result.html.data,
            subjectLines: result.subjectLines.data,
            copy: result.copy.data,
            qa: result.qa.data,
            totalTokens: result.totalTokens,
            totalDurationMs: result.totalDurationMs,
          },
        })}\n\n`;
        controller.enqueue(encoder.encode(finalEvent));
      } catch (error) {
        const errorEvent = `data: ${JSON.stringify({
          stage: "error",
          error: error instanceof Error ? error.message : "Pipeline failed",
        })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
