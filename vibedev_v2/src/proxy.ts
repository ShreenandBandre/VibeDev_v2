// src/proxy.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";


const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. ABSOLUTE EXCEPTION: Never touch API Auth routes
  // This stops the <DOCTYPE html> error
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Protect Dashboard
  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/sign-in", nextUrl));
  }

  // 3. Prevent logged-in users from seeing the sign-in page
  const isSignIn = nextUrl.pathname === "/auth/sign-in";
  if (isSignIn && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};