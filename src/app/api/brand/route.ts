import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  getAuthenticatedSession,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth-helpers";

/** Schema for brand profile updates */
const brandSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSizeBase: z.number().optional(),
  logoUrl: z.string().optional(),
  siteUrl: z.string().optional(),
  brandVoice: z.enum(["PROFESSIONAL", "CASUAL", "SALES_FOCUSED", "TECHNICAL"]).optional(),
  ctaStyle: z.string().optional(),
  customNotes: z.string().optional(),
});

/** GET /api/brand — Get the user's brand profile */
export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json({ success: true, data: { brandProfile } });
  } catch (error) {
    console.error("Get brand profile error:", error);
    return serverErrorResponse();
  }
}

/** POST /api/brand — Create or update the user's brand profile */
export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) return unauthorizedResponse();

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = brandSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const brandProfile = await prisma.brandProfile.upsert({
      where: { userId },
      update: parsed.data,
      create: {
        userId,
        ...parsed.data,
      },
    });

    return NextResponse.json({ success: true, data: { brandProfile } });
  } catch (error) {
    console.error("Update brand profile error:", error);
    return serverErrorResponse();
  }
}
