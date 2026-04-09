import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/** GET /api/track/click — Record a click event and redirect to target URL */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("cid");
  const contactId = searchParams.get("uid");
  const targetUrl = searchParams.get("url");

  if (campaignId && contactId) {
    try {
      await prisma.emailEvent.create({
        data: {
          campaignId,
          contactId,
          type: "CLICKED",
          metadata: targetUrl || undefined,
        },
      });

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalClicked: { increment: 1 } },
      });
    } catch (error) {
      console.error("Track click error:", error);
    }
  }

  // Redirect to the target URL
  const redirectUrl = targetUrl || "/";
  return NextResponse.redirect(redirectUrl, { status: 302 });
}
