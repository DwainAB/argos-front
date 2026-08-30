"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CurrentUser } from "@/lib/auth";

const UserContext = createContext<CurrentUser | null>(null);

// Fournit l'utilisateur connecté (déjà récupéré par le layout dashboard pour la
// vérification de session) au reste de l'arborescence, sans refaire l'appel /api/auth/me
// dans chaque composant qui en a besoin (Sidebar, Header, pages...).
export function UserProvider({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("useCurrentUser doit être utilisé dans un UserProvider");
  return user;
}
