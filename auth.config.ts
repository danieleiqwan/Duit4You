import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnTransactions = nextUrl.pathname.startsWith("/transactions");
      const isOnAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

      if (isOnDashboard || isOnTransactions) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to /login
      } else if (isOnAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
