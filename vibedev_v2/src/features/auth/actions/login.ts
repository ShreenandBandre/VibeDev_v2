"use server";

import { signIn } from "@/auth"; // Ensure this import points to your auth.ts
import { AuthError } from "next-auth";

export const loginAction = async (provider: "google" | "github") => {
  try {
    await signIn(provider, {
      redirectTo: "/dashboard", // This should force the redirect
      callbackUrl: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Log the error for your terminal
      console.error("Auth Error:", error.type);
      return { error: "Authentication failed." };
    }
    // IMPORTANT: Next.js redirects work by throwing an error internally
    throw error;
  }
};