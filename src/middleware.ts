import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) {
        const role = token?.role as string | undefined;
        return role === "ADMIN" || role === "PARTNER";
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
