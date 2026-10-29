import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Pages réservées aux utilisateurs connectés : un visiteur sans session Clerk est renvoyé
// vers /login avant même le rendu. L'existence du compte Argos AI (onboarding terminé) est
// vérifiée ensuite côté backend, voir dashboard/layout.tsx.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Toutes les pages sauf les fichiers statiques et les internes de Next.js.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
