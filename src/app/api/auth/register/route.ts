import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ── Validate request body ──────────────────────────────────────────
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(issue.message);
      }
      return NextResponse.json(
        { error: "Validation failed.", fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // ── Check for existing user ────────────────────────────────────────
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
          fieldErrors: { email: ["An account with this email already exists."] },
        },
        { status: 409 }
      );
    }

    // ── Hash password ──────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create user + credentials account in a transaction ─────────────
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          emailVerified: new Date(), // Credentials users are auto-verified
          role: email === process.env.ADMIN_EMAIL ? "ADMIN" : "READER",
        },
      });

      // Store password hash in the Account table's access_token field.
      // This keeps the User model clean and Auth.js-adapter compatible.
      await tx.account.create({
        data: {
          userId: newUser.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: newUser.id,
          access_token: hashedPassword,
        },
      });

      // Create a blank profile so the 1:1 relation always exists
      await tx.profile.create({
        data: { userId: newUser.id },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
