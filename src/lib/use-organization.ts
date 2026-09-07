"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api-fetch";

export type OrganizationMember = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  joinedAt: string;
};

export type OrganizationInvitation = {
  id: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
};

export type OrganizationProject = {
  id: string;
  name: string;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
  myRole: "admin" | "user";
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
  projects: OrganizationProject[];
};

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    return apiFetch("/api/organizations/me")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setOrganization(null);
          setError(data.error ?? null);
          return;
        }
        setOrganization(data.organization);
        setError(null);
      })
      .catch((err) => console.error("Erreur lors du chargement de l'organisation :", err));
  };

  useEffect(() => {
    let cancelled = false;

    refetch().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { organization, loading, error, refetch };
}
