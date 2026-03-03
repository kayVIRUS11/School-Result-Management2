import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/staff") ||
      pathname.startsWith("/student")
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  const role = session.user.role;

  if (pathname === "/login") {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "STAFF") return NextResponse.redirect(new URL("/staff", req.url));
    if (role === "STUDENT") return NextResponse.redirect(new URL("/student", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/staff") && role !== "STAFF") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/student/:path*", "/login"],
};