import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",

  // Public consent APIs
  "/api/public(.*)",

  // Public banner SDK APIs (not admin management routes)
  "/api/banner/consent(.*)",
  "/api/banner/displayed(.*)",
  "/api/banner/preferences(.*)",
  "/api/banner/receipt(.*)",
  "/api/banner/runtime(.*)",

  // Public consent pages
  "/c(.*)",

  // Public-facing pages (privacy policy, cookie policy, trust center)
  "/p/(.*)",
]);

export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
