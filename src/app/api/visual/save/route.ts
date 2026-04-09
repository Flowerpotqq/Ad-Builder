import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

const saveSchema = z.object({
  platform: z.string(),
  format: z.string(),
  visualType: z.string(),
  headline: z.string(),
  subtext: z.string().optional(),
  ctaText: z.string(),
  htmlSnapshot: z.string(),
  agentOutputs: z.record(z.unknown()),
  tags: z.array(z.string()).optional().default([]),
});

/** POST /api/visual/save — Save a generated visual ad to the library */
export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = saveSchema.safeParse(body);

    if (!parsed.success) return badRequestResponse(parsed.error.errors[0].message);

    const ad = await prisma.visualAd.create({
      data: {
        userId,
        ...parsed.data,
        agentOutputs: parsed.data.agentOutputs,
      },
    });

    return NextResponse.json({ success: true, data: { ad } }, { status: 201 });
  } catch (error) {
    console.error("Save visual ad error:", error);
    return serverErrorResponse();
  }
}
