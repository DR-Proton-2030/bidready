import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Allow login page to be accessible without a token
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // if (!token) {
  //   if (process.env.NODE_ENV === "development") {
  //     console.log("No token, redirecting to login...");
  //   }

  //   return NextResponse.redirect(new URL("/login", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/projects/:path*",
    "/users/:path*",
    "/blueprints/:path*",
    "/access-management/:path*",
  ],
};
