import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

/** Zod schema for registration input */
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** POST /api/auth/register — Create a new user account */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    // Create default brand profile for the new user
    await prisma.brandProfile.create({
      data: {
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

    return NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
