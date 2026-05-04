import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which paths are public (unprotected)
const publicPaths = ["/", "/login", "/api/health", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the path is public
  const isPublicPath = publicPaths.includes(pathname) || 
                       pathname.startsWith("/_next") || 
                       pathname.startsWith("/images");

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. Check for auth token in cookies
  // Note: We'll update the login page to save the token in a cookie as well
  const token = request.cookies.get("fudd-auth-token")?.value;

  if (!token) {
    // Redirect to login if no token is found and trying to access a protected route
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
