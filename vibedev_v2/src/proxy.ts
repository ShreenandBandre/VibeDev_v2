// src/proxy.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse, NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// 🚀 STEP 1: Define a core middleware runner that acts as the entry point
export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // 🚀 CRITICAL FIX: Intercept and pass API Auth routes BEFORE NextAuth initializes
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // STEP 2: For everything else, let NextAuth handle session checks safely
  return auth((authReq) => {
    const isLoggedIn = !!authReq.auth;
    const isDashboard = nextUrl.pathname.startsWith("/dashboard");
    const isSignIn = nextUrl.pathname === "/auth/sign-in";

    // Protect Dashboard
    if (isDashboard && !isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/sign-in", nextUrl));
    }

    // Prevent logged-in users from seeing the sign-in page
    if (isSignIn && isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    return NextResponse.next();
  })(req, {} as any); 
}

// STEP 3: Optimized Matcher matrix
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};