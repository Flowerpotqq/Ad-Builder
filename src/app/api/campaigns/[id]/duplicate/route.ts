import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** POST /api/campaigns/[id]/duplicate — Duplicate an existing campaign */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    const original = await prisma.campaign.findFirst({
      where: { id: params.id, userId },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Campaign not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const duplicate = await prisma.campaign.create({
      data: {
        userId,
        name: `${original.name} (Copy)`,
        type: original.type,
        status: "DRAFT",
        subject: original.subject,
        previewText: original.previewText,
        htmlContent: original.htmlContent,
        fromName: original.fromName,
        fromEmail: original.fromEmail,
      },
    });

    return NextResponse.json(
      { success: true, data: { campaign: duplicate } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Duplicate campaign error:", error);
    return serverErrorResponse();
  }
}
