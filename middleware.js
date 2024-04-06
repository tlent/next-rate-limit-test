import { NextResponse } from 'next/server';
import { kv as KV } from '@vercel/kv';

const RATE_LIMIT_WINDOW = 60; // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 10;

export async function middleware(req) {
  const ip = req.ip;
  const res = NextResponse.next();

  // Get current request count for the IP
  const currentRequestCount = (await KV.get(ip)) || 0;

  // Check if rate limit is exceeded
  if (currentRequestCount >= RATE_LIMIT_MAX_REQUESTS) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // Increment request count and set expiry
  await KV.put(ip, currentRequestCount + 1, { expirationTtl: RATE_LIMIT_WINDOW });

  return res;
}

export const config = {
  matcher: '/api/:path*', // Apply rate limiting to API routes
};