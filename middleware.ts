import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const isLoginPage = req.nextUrl.pathname === "/login";
    const isAuthenticated = Boolean(req.nextauth.token);

    if (isLoginPage && isAuthenticated) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const isAuthRoute = req.nextUrl.pathname.startsWith("/login");
        if (isAuthRoute) {
          return true;
        }
        return Boolean(token);
      },
    },
  }
);

export const config = {
  matcher: ["/(?!api/auth|_next/static|_next/image|favicon\\.ico|public).+"],
};
