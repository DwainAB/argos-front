"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { TextInput } from "@/components/dashboard/FormField";
import { Modal } from "@/components/dashboard/Modal";

export function NewProjectContent() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectToken, setProjectToken] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canOpenModal = projectName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/integrations/railway/connect-with-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, projectToken, serviceId, environmentId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

      // Le projet est créé et le streaming des logs démarré côté backend : on redirige
      // directement vers sa page pour voir les logs arriver.
      router.push(`/dashboard/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Ajouter un projet</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Donnez un nom à votre projet, puis connectez-le à Railway pour commencer la surveillance.
        </p>
      </div>

      <SettingsSection title="Nom du projet" description="Comment voulez-vous appeler ce projet dans Guardian AI ?">
        <TextInput
          label="Nom du projet"
          id="project-name"
          placeholder="ex: Guardian API"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </SettingsSection>

      <SettingsSection
        title="Connexion Railway"
        description="Renseignez les informations de votre projet Railway pour commencer la surveillance."
      >
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={!canOpenModal}
          title={!canOpenModal ? "Renseignez d'abord un nom de projet" : undefined}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Connecter Railway
        </button>
      </SettingsSection>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Connecter Railway">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-ink-secondary">
            Récupérez ces informations depuis votre projet Railway : Project Settings → Tokens pour le token,
            et l'URL du service pour les identifiants.
          </p>

          <TextInput
            label="Project Token"
            id="modal-project-token"
            type="password"
            placeholder="Collez votre Project Token"
            value={projectToken}
            onChange={(e) => setProjectToken(e.target.value)}
            required
          />
          <TextInput
            label="Service ID"
            id="modal-service-id"
            placeholder="ex: 27150691-8056-49cd-acdb-302214f9f1b4"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
          />
          <TextInput
            label="Environment ID"
            id="modal-environment-id"
            placeholder="ex: 76fc3e38-f32e-4def-8880-da1ae51848d2"
            value={environmentId}
            onChange={(e) => setEnvironmentId(e.target.value)}
            required
          />

          {error && <p className="text-sm text-status-critical">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Connecter"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
