import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js v5 (next-auth) — JWT sessions, Google identity only.
 * Credentials inferred from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
 * No database adapter.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      // Default scopes: openid email profile — sufficient for CP3.
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  trustHost: true,
});
