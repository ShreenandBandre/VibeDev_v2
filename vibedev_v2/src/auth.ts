// src/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt", // Keeping your default stateless handling
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // 🚀 CRITICAL: Capture OAuth payload on initial handshake
      if (user && account) {
        token.sub = user.id;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  events: {
    // 🚀 MAGIC LINK BLOCK: Direct force sync to account database record on login
    async signIn({ user, account }) {
      if (account && user.id) {
        const existingAccount = await prisma.account.findFirst({
          where: { providerAccountId: account.providerAccountId }
        });

        if (!existingAccount) {
          await prisma.account.create({
            data: {
              userId: user.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
            }
          });
        } else if (existingAccount.access_token !== account.access_token) {
          await prisma.account.update({
            where: { id: existingAccount.id },
            data: { access_token: account.access_token }
          });
        }
      }
    }
  }
});