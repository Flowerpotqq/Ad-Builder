import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

const versionSchema = z.object({
  htmlContent: z.string().min(1),
  instruction: z.string().optional(),
});

/** POST /api/campaigns/[id]/versions — Save a new version snapshot */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = versionSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    // Verify ownership
    const campaign = await prisma.campaign.findFirst({
      where: { id: params.id, userId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get the latest version number
    const latestVersion = await prisma.campaignVersion.findFirst({
      where: { campaignId: params.id },
      orderBy: { version: "desc" },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    // Create the version (limit to 10 most recent)
    const version = await prisma.campaignVersion.create({
      data: {
        campaignId: params.id,
        htmlContent: parsed.data.htmlContent,
        instruction: parsed.data.instruction,
        version: nextVersion,
      },
    });

    // Clean up old versions (keep only 10)
    const allVersions = await prisma.campaignVersion.findMany({
      where: { campaignId: params.id },
      orderBy: { version: "desc" },
      skip: 10,
    });

    if (allVersions.length > 0) {
      await prisma.campaignVersion.deleteMany({
        where: { id: { in: allVersions.map((v) => v.id) } },
      });
    }

    return NextResponse.json(
      { success: true, data: { version } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save version error:", error);
    return serverErrorResponse();
  }
}

/** GET /api/campaigns/[id]/versions — List version history */
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

    const versions = await prisma.campaignVersion.findMany({
      where: { campaignId: params.id },
      orderBy: { version: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, data: { versions } });
  } catch (error) {
    console.error("List versions error:", error);
    return serverErrorResponse();
  }
}
