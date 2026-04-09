import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** GET /api/templates — List templates for the user */
export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    const templates = await prisma.template.findMany({
      where: {
        OR: [{ userId }, { isDefault: true }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { templates } });
  } catch (error) {
    console.error("List templates error:", error);
    return serverErrorResponse();
  }
}
