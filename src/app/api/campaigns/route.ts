import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** Schema for creating a new campaign */
const createSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  type: z.enum(["PROMOTIONAL", "NEWSLETTER", "FOLLOW_UP", "ANNOUNCEMENT"]).default("PROMOTIONAL"),
});

/** GET /api/campaigns — List all campaigns for the authenticated user */
export async function GET(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          contactList: { select: { name: true, _count: { select: { contacts: true } } } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("List campaigns error:", error);
    return serverErrorResponse();
  }
}

/** POST /api/campaigns — Create a new campaign */
export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name: parsed.data.name,
        type: parsed.data.type,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ success: true, data: { campaign } }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return serverErrorResponse();
  }
}
