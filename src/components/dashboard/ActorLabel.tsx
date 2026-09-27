"use client";

import { useCurrentUser } from "./UserContext";

export type Actor = { userId: string; firstName: string; lastName: string } | null;

// Affiche "vous" si l'acteur est l'utilisateur actuellement connecté, sinon son nom complet —
// utilisé partout où une action est attribuée (alerte résolue, correctif accepté, analyse
// lancée...).
export function ActorLabel({ actor }: { actor: Actor }) {
  const currentUser = useCurrentUser();

  if (!actor) return null;

  return <>{actor.userId === currentUser.id ? "vous" : `${actor.firstName} ${actor.lastName}`}</>;
}
