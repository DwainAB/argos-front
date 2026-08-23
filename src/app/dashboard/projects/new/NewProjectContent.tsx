"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/config";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { TextInput, SelectField } from "@/components/dashboard/FormField";
import { Modal } from "@/components/dashboard/Modal";

type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  defaultBranch: string;
};

const RETURN_PATH = "/dashboard/projects/new";

export function NewProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const githubInstallationId = searchParams.get("github_installation_id");
  const githubProjectIdFromReturn = searchParams.get("github_project_id");
  const githubError = searchParams.get("github_error");

  const [modalOpen, setModalOpen] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectToken, setProjectToken] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Une fois Railway connecté, le projet existe en base : on garde son id pour la suite
  // (bouton GitHub, redirection finale). Restauré depuis l'URL si on revient d'un callback
  // GitHub (le projet a été créé avant la redirection vers l'installation GitHub).
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(githubProjectIdFromReturn);
  const [githubRepo, setGithubRepo] = useState<string | null>(null);
  const [githubBranch, setGithubBranch] = useState<string | null>(null);

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

      setCreatedProjectId(data.project.id);
      setModalOpen(false);
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
          Donnez un nom à votre projet, puis connectez-le à Railway et à GitHub.
        </p>
      </div>

      <SettingsSection title="Nom du projet" description="Comment voulez-vous appeler ce projet dans Argos AI ?">
        <TextInput
          label="Nom du projet"
          id="project-name"
          placeholder="ex: Argos API"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          disabled={!!createdProjectId}
        />
      </SettingsSection>

      <SettingsSection
        title="Connexions"
        description="Connectez Railway pour la collecte des logs, et GitHub pour permettre à l'IA de proposer des corrections."
      >
        {githubError && (
          <p className="mb-3 text-sm text-status-critical">
            La connexion à GitHub a échoué ({githubError}). Réessayez.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={!canOpenModal || !!createdProjectId}
            title={!canOpenModal ? "Renseignez d'abord un nom de projet" : undefined}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createdProjectId ? "Railway connecté ✓" : "Connecter Railway"}
          </button>

          <a
            href={
              createdProjectId
                ? `${API_URL}/api/integrations/github/start?projectId=${createdProjectId}&returnPath=${encodeURIComponent(RETURN_PATH)}`
                : undefined
            }
            aria-disabled={!createdProjectId}
            title={!createdProjectId ? "Connectez d'abord Railway" : undefined}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              createdProjectId
                ? "border-surface-border/10 text-ink-primary hover:bg-surface-border/5"
                : "cursor-not-allowed border-surface-border/10 text-ink-muted opacity-50"
            }`}
          >
            {githubRepo ? `GitHub connecté ✓ (${githubRepo})` : "Connecter GitHub"}
          </a>
        </div>

        {createdProjectId && githubInstallationId && !githubRepo && (
          <GithubRepoPicker
            projectId={createdProjectId}
            installationId={githubInstallationId}
            onSaved={(repo, branch) => {
              setGithubRepo(repo);
              setGithubBranch(branch);
            }}
          />
        )}
      </SettingsSection>

      {createdProjectId && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/projects/${createdProjectId}`)}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Aller au projet
          </button>
        </div>
      )}

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

// Affiché juste après le retour de l'installation GitHub : sélection du dépôt puis de la
// branche à associer au projet fraîchement créé.
function GithubRepoPicker({
  projectId,
  installationId,
  onSaved,
}: {
  projectId: string;
  installationId: string;
  onSaved: (repo: string, branch: string) => void;
}) {
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);

  const [selectedRepoFullName, setSelectedRepoFullName] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/integrations/github/repos?installationId=${installationId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Erreur inconnue");
        return res.json();
      })
      .then((data) => setRepos(data.repos))
      .catch((err) => setReposError(err.message))
      .finally(() => setLoadingRepos(false));
  }, [installationId]);

  const selectedRepo = repos?.find((r) => r.fullName === selectedRepoFullName);

  useEffect(() => {
    if (!selectedRepo) return;

    const [owner, repo] = selectedRepo.fullName.split("/");
    setLoadingBranches(true);
    setBranches([]);

    fetch(`${API_URL}/api/integrations/github/branches?installationId=${installationId}&owner=${owner}&repo=${repo}`)
      .then((res) => res.json())
      .then((data) => {
        setBranches(data.branches ?? []);
        setSelectedBranch(selectedRepo.defaultBranch);
      })
      .catch((err) => console.error("Erreur lors du chargement des branches :", err))
      .finally(() => setLoadingBranches(false));
  }, [selectedRepo, installationId]);

  const handleSave = async () => {
    if (!selectedRepoFullName || !selectedBranch) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId, repoFullName: selectedRepoFullName, branch: selectedBranch }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      onSaved(selectedRepoFullName, selectedBranch);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 border-t border-surface-border/10 pt-4">
      {loadingRepos && <p className="text-sm text-ink-secondary">Chargement des dépôts...</p>}
      {reposError && <p className="text-sm text-status-critical">{reposError}</p>}

      {repos && repos.length === 0 && (
        <p className="text-sm text-ink-secondary">
          Aucun dépôt accessible. Vérifiez que l'installation GitHub a bien accès à au moins un dépôt.
        </p>
      )}

      {repos && repos.length > 0 && (
        <>
          <SelectField
            label="Dépôt"
            id="new-project-github-repo"
            value={selectedRepoFullName}
            onChange={(e) => setSelectedRepoFullName(e.target.value)}
          >
            <option value="">Sélectionnez un dépôt</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.fullName}>
                {repo.fullName}
              </option>
            ))}
          </SelectField>

          {selectedRepo && (
            <SelectField
              label="Branche"
              id="new-project-github-branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={loadingBranches}
            >
              {loadingBranches ? (
                <option>Chargement...</option>
              ) : (
                branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))
              )}
            </SelectField>
          )}

          {saveError && <p className="text-sm text-status-critical">{saveError}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedRepoFullName || !selectedBranch || saving}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Associer ce dépôt"}
          </button>
        </>
      )}
    </div>
  );
}
