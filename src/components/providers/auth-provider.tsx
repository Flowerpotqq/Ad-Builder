"use client";

import { SessionProvider } from "next-auth/react";

/** Wraps the app in NextAuth session context */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
