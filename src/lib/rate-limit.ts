/** Simple in-memory rate limiter for AI endpoints */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a user has exceeded their rate limit.
 * Returns true if the request should be blocked.
 */
export function isRateLimited(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}

/** Get remaining requests for a user */
export function getRemainingRequests(
  userId: string,
  maxRequests: number = 10
): number {
  const entry = rateLimitMap.get(userId);
  if (!entry || Date.now() > entry.resetAt) return maxRequests;
  return Math.max(0, maxRequests - entry.count);
}
