import { z } from "zod";

/** Environment variable schema — validates all required config on startup */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL must be a valid email").optional(),
  RESEND_FROM_NAME: z.string().optional().default("NAP Solutions"),
  APP_URL: z.string().url().optional().default("http://localhost:3000"),
  AI_RATE_LIMIT_MAX: z.coerce.number().optional().default(10),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().optional().default(60000),
});

export type Env = z.infer<typeof envSchema>;

/** Validated environment variables */
export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables. Check your .env.local file.");
  }
  return parsed.data;
}
