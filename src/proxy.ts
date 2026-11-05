import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const handleI18n = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return handleI18n(request);
}

export default proxy;

export const config = {
  // Match all request paths except for:
  // - _next (Next.js internals)
  // - files with extensions (e.g. favicon.ico, images)
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
