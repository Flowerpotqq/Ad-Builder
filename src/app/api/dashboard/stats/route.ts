import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** GET /api/dashboard/stats — Dashboard summary statistics */
export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    const [totalCampaigns, totalContacts, sentCampaigns, recentCampaigns] = await Promise.all([
      prisma.campaign.count({ where: { userId } }),
      prisma.contact.count({
        where: { list: { userId } },
      }),
      prisma.campaign.findMany({
        where: { userId, status: "SENT", totalSent: { gt: 0 } },
        select: { totalSent: true, totalOpened: true },
      }),
      prisma.campaign.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          totalSent: true,
          totalOpened: true,
        },
      }),
    ]);

    // Calculate average open rate
    let avgOpenRate = 0;
    if (sentCampaigns.length > 0) {
      const totalSent = sentCampaigns.reduce((acc, c) => acc + c.totalSent, 0);
      const totalOpened = sentCampaigns.reduce((acc, c) => acc + c.totalOpened, 0);
      avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCampaigns,
        totalContacts,
        avgOpenRate,
        recentCampaigns,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return serverErrorResponse();
  }
}
