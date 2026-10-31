"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { UserProvider } from "@/components/dashboard/UserContext";
import { PaymentGraceBanner } from "@/components/dashboard/PaymentGraceBanner";
import { getCurrentUser, OnboardingRequiredError, type CurrentUser } from "@/lib/auth";

// Seule page accessible sans abonnement actif — sert justement à en démarrer un.
const SUBSCRIBE_PATH = "/dashboard/subscribe";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const { userId: clerkUserId } = useAuth();
  const previousClerkUserId = useRef(clerkUserId);

  // Bascule vers un autre compte depuis le menu compte (mode multi-session de Clerk) :
  // rechargement complet du dashboard, pour qu'aucun composant ne garde en mémoire les
  // projets ou l'abonnement du compte précédent.
  useEffect(() => {
    if (previousClerkUserId.current && clerkUserId && previousClerkUserId.current !== clerkUserId) {
      window.location.assign("/dashboard");
    }
    previousClerkUserId.current = clerkUserId;
  }, [clerkUserId]);

  useEffect(() => {
    let cancelled = false;

    const checkSession = () => {
      getCurrentUser()
        .then((fetchedUser) => {
          if (cancelled) return;
          if (!fetchedUser) {
            router.replace("/login");
            return;
          }
          if (!fetchedUser.hasActiveSubscription && pathname !== SUBSCRIBE_PATH) {
            router.replace(SUBSCRIBE_PATH);
            return;
          }
          if (fetchedUser.hasActiveSubscription && pathname === SUBSCRIBE_PATH) {
            router.replace("/dashboard");
            return;
          }
          setUser(fetchedUser);
        })
        .catch((err) => {
          if (cancelled) return;
          // Connecté chez Clerk mais compte Argos AI pas encore configuré.
          if (err instanceof OnboardingRequiredError) {
            router.replace("/onboarding");
            return;
          }
          console.error("Erreur lors de la vérification de la session :", err);
          router.replace("/login");
        });
    };

    checkSession();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && pathname === SUBSCRIBE_PATH) {
        checkSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router, pathname]);

  if (!user) {
    return null;
  }

  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Header />
            <PaymentGraceBanner />
            <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
