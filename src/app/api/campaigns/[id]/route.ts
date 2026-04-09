import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** Schema for updating a campaign */
const updateSchema = z.object({
  name: z.string().optional(),
  subject: z.string().optional(),
  subjectB: z.string().nullable().optional(),
  previewText: z.string().optional(),
  htmlContent: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().optional(),
  contactListId: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "FAILED"]).optional(),
});

/** GET /api/campaigns/[id] — Get a single campaign */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    const campaign = await prisma.campaign.findFirst({
      where: { id: params.id, userId },
      include: {
        contactList: {
          include: { _count: { select: { contacts: true } } },
        },
        versions: {
          orderBy: { version: "desc" },
          take: 10,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { campaign } });
  } catch (error) {
    console.error("Get campaign error:", error);
    return serverErrorResponse();
  }
}

/** PATCH /api/campaigns/[id] — Update a campaign */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    // Verify ownership
    const existing = await prisma.campaign.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Campaign not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.scheduledAt) {
      updateData.scheduledAt = new Date(parsed.data.scheduledAt);
    }

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: { campaign } });
  } catch (error) {
    console.error("Update campaign error:", error);
    return serverErrorResponse();
  }
}

/** DELETE /api/campaigns/[id] — Delete a campaign */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    const existing = await prisma.campaign.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Campaign not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    await prisma.campaign.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return serverErrorResponse();
  }
}
