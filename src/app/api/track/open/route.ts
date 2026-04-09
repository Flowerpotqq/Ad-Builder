import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/** 1x1 transparent GIF pixel */
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

/** GET /api/track/open — Record an email open event via tracking pixel */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("cid");
  const contactId = searchParams.get("uid");

  if (campaignId && contactId) {
    try {
      // Record the open event (avoid duplicates — record each open)
      await prisma.emailEvent.create({
        data: {
          campaignId,
          contactId,
          type: "OPENED",
        },
      });

      // Update campaign open count
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalOpened: { increment: 1 } },
      });
    } catch (error) {
      // Don't fail the pixel response on DB errors
      console.error("Track open error:", error);
    }
  }

  return new NextResponse(TRACKING_PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
