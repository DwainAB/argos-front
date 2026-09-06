"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { TextInput } from "@/components/dashboard/FormField";

type ProjectShare = {
  id: string;
  email: string;
  sharedWithUserId: string | null;
  createdAt: string;
};

export function ProjectSharesSection({ projectId }: { projectId: string }) {
  const [shares, setShares] = useState<ProjectShare[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    return apiFetch(`/api/projects/${projectId}/shares`)
      .then((res) => res.json())
      .then((data) => setShares(data.shares ?? []))
      .catch((err) => console.error(`Erreur lors du chargement des partages du projet ${projectId} :`, err));
  };

  useEffect(() => {
    let cancelled = false;

    refetch().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };

  }, [projectId]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/projects/${projectId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

      setEmail("");
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de partager ce projet.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnshare = async (shareId: string) => {
    try {
      const res = await apiFetch(`/api/projects/${projectId}/shares/${shareId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur inconnue");
      await refetch();
    } catch (err) {
      console.error(`Erreur lors du retrait du partage ${shareId} :`, err);
    }
  };

  return (
    <SettingsSection
      title="Partage du projet"
      description="Donnez accès à ce projet à un compte personnel, par email. La personne le voit apparaître dans ses propres projets."
    >
      <ul className="mb-4 space-y-2">
        {loading ? (
          <p className="text-sm text-ink-secondary">Chargement...</p>
        ) : shares.length === 0 ? (
          <p className="text-sm text-ink-secondary">Ce projet n'est partagé avec personne pour l'instant.</p>
        ) : (
          shares.map((share) => (
            <li
              key={share.id}
              className="flex items-center justify-between rounded-lg border border-surface-border/10 bg-surface px-3 py-2"
            >
              <div>
                <p className="text-sm text-ink-primary">{share.email}</p>
                {!share.sharedWithUserId && (
                  <p className="text-xs text-ink-muted">En attente — accès activé dès son inscription.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleUnshare(share.id)}
                className="text-xs text-status-critical hover:underline"
              >
                Retirer
              </button>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={handleShare} className="flex items-end gap-3">
        <div className="flex-1">
          <TextInput
            label="Email"
            id="share-email"
            type="email"
            placeholder="jean@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Partage..." : "Partager"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-status-critical">{error}</p>}
    </SettingsSection>
  );
}
