import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware is disabled for local single-user mode.
 * All routes are allowed without redirecting to /login.
 */
export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}
