import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** GET /api/contacts/[listId] — Get contacts in a list */
export async function GET(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");

    // Verify ownership
    const list = await prisma.contactList.findFirst({
      where: { id: params.listId, userId },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const where: Record<string, unknown> = { listId: params.listId };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        contacts,
        list,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return serverErrorResponse();
  }
}

/** DELETE /api/contacts/[listId] — Delete a contact list */
export async function DELETE(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    const list = await prisma.contactList.findFirst({
      where: { id: params.listId, userId },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    await prisma.contactList.delete({ where: { id: params.listId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete list error:", error);
    return serverErrorResponse();
  }
}
