import { withAuth } from "next-auth/middleware";

// Everything under /feed and the data APIs requires a signed-in user.
// /api/articles/refresh is intentionally excluded — it authenticates the
// cron job with CRON_SECRET instead (see app/api/articles/refresh/route.js).
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/feed/:path*",
    "/community/:path*",
    "/api/articles",
    "/api/interactions/:path*",
    "/api/users/:path*",
    "/api/follows/:path*",
    "/api/reposts/:path*",
    "/api/feed/following/:path*",
  ],
};
