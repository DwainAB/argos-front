"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { UserProvider } from "@/components/dashboard/UserContext";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

// Seule page accessible sans abonnement actif — sert justement à en démarrer un.
const SUBSCRIBE_PATH = "/dashboard/subscribe";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

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
        setUser(fetchedUser);
      })
      .catch((err) => {
        console.error("Erreur lors de la vérification de la session :", err);
        if (!cancelled) router.replace("/login");
      });

    return () => {
      cancelled = true;
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
            <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
