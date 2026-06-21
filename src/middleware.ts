import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Specifically intercept capitalized portal routes and safely rewrite them to lowercase
  // We only target /portal/ to avoid affecting dynamic IDs like /portal/vault/[vaultId] which MUST remain case-sensitive
  const path = url.pathname;
  if (path.startsWith('/portal/')) {
    const parts = path.split('/');
    // parts[0] = "", parts[1] = "portal", parts[2] = "Doctor", parts[3] = ...
    if (parts.length === 3) {
      const role = parts[2];
      if (role !== role.toLowerCase()) {
        parts[2] = role.toLowerCase();
        url.pathname = parts.join('/');
        return NextResponse.redirect(url);
      }
    }
  }
}

export const config = {
  matcher: '/portal/:path*',
}
