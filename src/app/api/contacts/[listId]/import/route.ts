import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** Schema for individual contact import */
const contactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const importSchema = z.object({
  contacts: z.array(contactSchema).min(1, "At least one contact is required"),
});

/** POST /api/contacts/[listId]/import — Bulk import contacts (from CSV parse) */
export async function POST(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    // Verify list ownership
    const list = await prisma.contactList.findFirst({
      where: { id: params.listId, userId },
    });

    if (!list) {
      return NextResponse.json({ error: "Contact list not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    // Upsert contacts (skip duplicates)
    let imported = 0;
    let skipped = 0;

    for (const contact of parsed.data.contacts) {
      try {
        await prisma.contact.upsert({
          where: {
            listId_email: { listId: params.listId, email: contact.email },
          },
          update: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            tags: contact.tags || [],
          },
          create: {
            listId: params.listId,
            email: contact.email,
            firstName: contact.firstName,
            lastName: contact.lastName,
            tags: contact.tags || [],
          },
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      data: { imported, skipped, total: parsed.data.contacts.length },
    });
  } catch (error) {
    console.error("Import contacts error:", error);
    return serverErrorResponse();
  }
}
