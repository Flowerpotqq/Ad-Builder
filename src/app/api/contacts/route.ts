import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

const createListSchema = z.object({
  name: z.string().min(1, "List name is required"),
});

/** GET /api/contacts — Get all contact lists */
export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    const lists = await prisma.contactList.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { contacts: true } } },
    });

    return NextResponse.json({ success: true, data: { lists } });
  } catch (error) {
    console.error("List contacts error:", error);
    return serverErrorResponse();
  }
}

/** POST /api/contacts — Create a new contact list */
export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = createListSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const list = await prisma.contactList.create({
      data: { userId, name: parsed.data.name },
    });

    return NextResponse.json({ success: true, data: { list } }, { status: 201 });
  } catch (error) {
    console.error("Create contact list error:", error);
    return serverErrorResponse();
  }
}
