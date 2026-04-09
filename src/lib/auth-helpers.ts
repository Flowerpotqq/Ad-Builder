import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const AUTH_BYPASS_ENABLED = process.env.AUTH_BYPASS !== "false";

type LocalSessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

/** Create or reuse a local single-user account for auth-bypass mode */
async function getOrCreateLocalUser(): Promise<LocalSessionUser> {
  let user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Local Admin",
        email: "local-admin@napsolutions.local",
        // Placeholder only; login is bypassed in this mode.
        hashedPassword: "auth-bypass-local-user",
        role: "ADMIN",
      },
    });
  }

  await prisma.brandProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      primaryColor: "#0e0e2c",
      secondaryColor: "#1a1a4e",
      accentColor: "#b8dff0",
      backgroundColor: "#ffffff",
      textColor: "#333333",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSizeBase: 16,
      siteUrl: "https://getnapsolutions.com",
      brandVoice: "SALES_FOCUSED",
      ctaStyle: "Dark navy background, white bold text, 8px border radius",
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}

/**
 * Get the authenticated user's session, or return a 401 response.
 * Use in API routes to protect endpoints.
 */
export async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) {
    if (!AUTH_BYPASS_ENABLED) {
      return null;
    }

    const localUser = await getOrCreateLocalUser();
    return {
      user: localUser,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
  return session;
}

/** Standard 401 unauthorized response */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized", code: "UNAUTHORIZED" },
    { status: 401 }
  );
}

/** Standard 400 bad request response */
export function badRequestResponse(message: string) {
  return NextResponse.json(
    { error: message, code: "BAD_REQUEST" },
    { status: 400 }
  );
}

/** Standard 500 internal error response */
export function serverErrorResponse(message: string = "Internal server error") {
  return NextResponse.json(
    { error: message, code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}
