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
};

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
