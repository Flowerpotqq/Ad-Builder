import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** GET /api/campaigns/[id]/events — Get email events for a campaign */
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
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const events = await prisma.emailEvent.findMany({
      where: { campaignId: params.id },
      orderBy: { timestamp: "desc" },
      take: 100,
      include: {
        contact: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, data: { events } });
  } catch (error) {
    console.error("Get events error:", error);
    return serverErrorResponse();
  }
}
