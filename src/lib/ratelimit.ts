import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Redis is provisioned via Vercel Marketplace (Upstash integration).
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set automatically.
const redis = Redis.fromEnv();

export const rateLimiters = {
  /** Payment initiation endpoints — 5 requests/min per IP */
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'rl:pay',
  }),

  /** Booking creation — 10 requests/min per IP */
  bookings: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'rl:book',
  }),

  /** Admin mutations — 20 requests/min per IP */
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    prefix: 'rl:admin',
  }),
};

/** Extract client IP from Vercel/Next.js request headers */
export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

/** Returns a 429 Response with standard rate-limit headers */
export function tooManyRequests(reset: number, limit: number): Response {
  return Response.json(
    { error: 'Too many requests. Please wait before trying again.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    }
  );
}
