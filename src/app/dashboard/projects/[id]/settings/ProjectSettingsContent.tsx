"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { useProjects } from "@/lib/use-projects";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { TextInput, SelectField } from "@/components/dashboard/FormField";
import { GithubConnectButton } from "@/components/dashboard/GithubConnectButton";
import { IconPlus } from "@/components/icons/NavIcons";

type NotifiedPerson = {
  id: string;
  name: string;
  contact: string;
};

type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  defaultBranch: string;
};

export function ProjectSettingsContent({ projectId }: { projectId: string }) {
  const [githubInstallationId, setGithubInstallationId] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  const { projects, loading: projectsLoading, refetch: refetchProjects } = useProjects();
  const project = projects.find((p) => p.id === projectId);

  const [notified, setNotified] = useState<NotifiedPerson[]>([
    { id: "p1", name: "Marine Sola", contact: "marinesola348@gmail.com" },
  ]);
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");

  // Repos accessibles une fois l'installation GitHub effectuée.
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);

  const [selectedRepoFullName, setSelectedRepoFullName] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  // Une fois revenu de l'installation GitHub, on récupère la liste des repos accessibles.
  useEffect(() => {
    if (!githubInstallationId) return;

    setLoadingRepos(true);
    setReposError(null);

    apiFetch(`/api/integrations/github/repos?installationId=${githubInstallationId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Erreur inconnue");
        return res.json();
      })
      .then((data) => setRepos(data.repos))
      .catch((err) => setReposError(err.message))
      .finally(() => setLoadingRepos(false));
  }, [githubInstallationId]);

  // Synchronise le champ nom avec le projet une fois chargé (et à chaque changement de projet).
  useEffect(() => {
    if (project) setProjectName(project.name);
  }, [project]);

  const selectedRepo = repos?.find((r) => r.fullName === selectedRepoFullName);

  // Quand un repo est choisi, on récupère ses branches.
  useEffect(() => {
    if (!selectedRepo || !githubInstallationId) return;

    const [owner, repo] = selectedRepo.fullName.split("/");
    setLoadingBranches(true);
    setBranches([]);

    apiFetch(
      `/api/integrations/github/branches?installationId=${githubInstallationId}&owner=${owner}&repo=${repo}`
    )
      .then((res) => res.json())
      .then((data) => {
        setBranches(data.branches ?? []);
        setSelectedBranch(selectedRepo.defaultBranch);
      })
      .catch((err) => console.error("Erreur lors du chargement des branches :", err))
      .finally(() => setLoadingBranches(false));
  }, [selectedRepo, githubInstallationId]);

  const handleSaveGithub = async () => {
    if (!githubInstallationId || !selectedRepoFullName || !selectedBranch) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await apiFetch(`/api/projects/${projectId}/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installationId: githubInstallationId,
          repoFullName: selectedRepoFullName,
          branch: selectedBranch,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setSavingName(true);
    setNameError(null);
    setNameSaved(false);

    try {
      const res = await apiFetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      await refetchProjects();
      setNameSaved(true);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSavingName(false);
    }
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContact.trim()) return;
    setNotified((prev) => [...prev, { id: crypto.randomUUID(), name: newName, contact: newContact }]);
    setNewName("");
    setNewContact("");
  };

  const handleRemovePerson = (id: string) => {
    setNotified((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDelete = () => {
    // Aucune suppression réelle pour l'instant, confirmation à brancher avec le backend.
  };

  if (projectsLoading) {
    return <p className="text-sm text-ink-secondary">Chargement...</p>;
  }

  if (!project) {
    return <p className="text-sm text-ink-secondary">Projet introuvable.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Paramètres du projet</h1>
        <p className="mt-1 text-sm text-ink-secondary">Configuration de {project.name}.</p>
      </div>

      <SettingsSection title="Informations générales" description="Nom du projet.">
        <form onSubmit={handleGeneralSubmit} className="space-y-4">
          <TextInput
            label="Nom du projet"
            id="project-name"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setNameSaved(false);
              setNameError(null);
            }}
          />
          {nameError && <p className="text-sm text-status-critical">{nameError}</p>}
          {nameSaved && <p className="text-sm text-status-good">Nom du projet mis à jour.</p>}
          <button
            type="submit"
            disabled={savingName || !projectName.trim()}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingName ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Dépôt GitHub"
        description="Associez un dépôt GitHub à ce projet pour permettre à l'IA de proposer des corrections en cas d'erreur."
      >
        {githubError && (
          <p className="mb-3 text-sm text-status-critical">
            La connexion à GitHub a échoué ({githubError}). Réessayez.
          </p>
        )}

        {project.githubRepo && !githubInstallationId ? (
          <p className="text-sm text-status-good">
            Connecté à <span className="font-mono">{project.githubRepo}</span> (branche{" "}
            <span className="font-mono">{project.githubBranch}</span>).
          </p>
        ) : !githubInstallationId ? (
          <GithubConnectButton
            projectId={projectId}
            onResult={(result) => {
              if ("error" in result) {
                setGithubError(result.error);
              } else {
                setGithubError(null);
                setGithubInstallationId(result.installationId);
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Connecter GitHub
          </GithubConnectButton>
        ) : (
          <div className="space-y-4">
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
                  id="github-repo"
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
                    id="github-branch"
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
                {saved && <p className="text-sm text-status-good">Dépôt GitHub associé avec succès.</p>}

                <button
                  type="button"
                  onClick={handleSaveGithub}
                  disabled={!selectedRepoFullName || !selectedBranch || saving}
                  className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Associer ce dépôt"}
                </button>
              </>
            )}
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Personnes à notifier"
        description="Ces personnes reçoivent un SMS ou un email lorsqu'une alerte est détectée sur ce projet."
      >
        <ul className="mb-4 space-y-2">
          {notified.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between rounded-lg border border-surface-border/10 bg-surface px-3 py-2"
            >
              <div>
                <p className="text-sm text-ink-primary">{person.name}</p>
                <p className="text-xs text-ink-muted">{person.contact}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePerson(person.id)}
                className="text-xs text-status-critical hover:underline"
              >
                Retirer
              </button>
            </li>
          ))}
          {notified.length === 0 && (
            <p className="text-sm text-ink-secondary">Personne n'est notifié pour ce projet actuellement.</p>
          )}
        </ul>

        <form onSubmit={handleAddPerson} className="flex items-end gap-3">
          <div className="flex-1">
            <TextInput
              label="Nom"
              id="new-person-name"
              placeholder="Jean Dupont"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <TextInput
              label="Email ou téléphone"
              id="new-person-contact"
              placeholder="jean@exemple.com"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            <IconPlus className="h-4 w-4" />
            Ajouter
          </button>
        </form>
      </SettingsSection>

      <section className="rounded-xl border border-status-critical/30 bg-status-critical/5 p-5">
        <h2 className="text-sm font-medium text-status-critical">Zone de danger</h2>
        <p className="mt-1 text-xs text-ink-secondary">
          Supprimer ce projet arrêtera la collecte de logs et supprimera son historique. Cette action est irréversible.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          className="mt-4 rounded-lg border border-status-critical/40 px-4 py-2 text-sm font-medium text-status-critical transition hover:bg-status-critical/10"
        >
          Supprimer le projet
        </button>
      </section>
    </div>
  );
}
