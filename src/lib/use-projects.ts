"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api-fetch";

export type ApiProject = {
  id: string;
  name: string;
  githubRepo: string | null;
  githubBranch: string | null;
  railwayServiceId: string | null;
  railwayEnvironmentId: string | null;
  createdAt: string;
  // Propriétaire du projet (son créateur, pas forcément l'utilisateur courant — un projet
  // partagé garde le compte organisation d'origine comme propriétaire). Sert à afficher
  // à qui appartient chaque projet (section "Personnel" ou nom de l'organisation).
  user: { accountType: "personal" | "organization"; organizationName: string | null };
};

// Libellé de section à afficher pour un projet donné : le nom de l'organisation
// propriétaire, ou "Personnel" si son propriétaire est un compte personnel.
export function projectOwnerLabel(project: ApiProject) {
  return project.user.accountType === "organization" ? project.user.organizationName ?? "Organisation" : "Personnel";
}

// Récupère la liste des projets connectés depuis le backend. Utilisé par la sidebar et
// le sélecteur de projet pour refléter les vrais projets créés par l'utilisateur.
export function useProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    return apiFetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects ?? []);
      })
      .catch((err) => console.error("Erreur lors du chargement des projets :", err));
  };

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProjects(data.projects ?? []);
      })
      .catch((err) => console.error("Erreur lors du chargement des projets :", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, refetch };
}
