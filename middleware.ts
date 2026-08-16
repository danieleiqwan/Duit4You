import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/ai-assistant/:path*", "/login", "/register"],
};
