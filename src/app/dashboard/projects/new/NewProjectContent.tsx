"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-fetch";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { TextInput, SelectField } from "@/components/dashboard/FormField";
import { Modal } from "@/components/dashboard/Modal";
import { GithubConnectButton } from "@/components/dashboard/GithubConnectButton";
import { GitlabConnectButton } from "@/components/dashboard/GitlabConnectButton";

type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  defaultBranch: string;
};

type GitlabProject = {
  id: number;
  name: string;
  fullPath: string;
  defaultBranch: string;
};

type HostingProvider = "railway" | "render";
type CodeProvider = "github" | "gitlab";

type RailwayCredentials = { projectToken: string; serviceId: string; environmentId: string };
type RenderCredentials =
  | { apiKeyId: string; ownerId: string; resourceId: string }
  | { newApiKey: string; newApiKeyLabel?: string; ownerId: string; resourceId: string };
type GithubSelection = { installationId: string; repoFullName: string; branch: string };
type GitlabSelection = { connectionId: string; gitlabProjectId: number; repoFullPath: string; branch: string };

function RailwayLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M.113 10.27A13.026 13.026 0 000 11.48h18.23c-.064-.125-.15-.237-.235-.347-3.117-4.027-4.793-3.677-7.19-3.78-.8-.034-1.34-.048-4.524-.048-1.704 0-3.555.005-5.358.01-.234.63-.459 1.24-.567 1.737h9.342v1.216H.113v.002zm18.26 2.426H.009c.02.326.05.645.094.961h16.955c.754 0 1.179-.429 1.315-.96zm-17.318 4.28s2.81 6.902 10.93 7.024c4.855 0 9.027-2.883 10.92-7.024H1.056zM11.988 0C7.5 0 3.593 2.466 1.531 6.108l4.75-.005v-.002c3.71 0 3.849.016 4.573.047l.448.016c1.563.052 3.485.22 4.996 1.364.82.621 2.007 1.99 2.712 2.965.654.902.842 1.94.396 2.934-.408.914-1.289 1.458-2.353 1.458H.391s.099.42.249.886h22.748A12.026 12.026 0 0024 12.005C24 5.377 18.621 0 11.988 0z" />
    </svg>
  );
}

function RenderLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.263.007c-3.121-.147-5.744 2.109-6.192 5.082-.018.138-.045.272-.067.405-.696 3.703-3.936 6.507-7.827 6.507-1.388 0-2.691-.356-3.825-.979a.2024.2024 0 0 0-.302.178V24H12v-8.999c0-1.656 1.338-3 2.987-3h2.988c3.382 0 6.103-2.817 5.97-6.244-.12-3.084-2.61-5.603-5.682-5.75" />
    </svg>
  );
}

const PROVIDER_BRAND: Record<
  HostingProvider,
  { color: string; hoverColor: string; textColor: string; Logo: typeof RailwayLogo; label: string }
> = {
  railway: { color: "#6C3FE7", hoverColor: "#5C34C4", textColor: "#FFFFFF", Logo: RailwayLogo, label: "Railway" },
  render: { color: "#46E3B7", hoverColor: "#33C9A0", textColor: "#0D0C14", Logo: RenderLogo, label: "Render" },
};

export function NewProjectContent() {
  const router = useRouter();

  const [projectName, setProjectName] = useState("");

  const [openProviderModal, setOpenProviderModal] = useState<HostingProvider | null>(null);
  const [provider, setProvider] = useState<HostingProvider | null>(null);
  const [railwayCredentials, setRailwayCredentials] = useState<RailwayCredentials | null>(null);
  const [renderCredentials, setRenderCredentials] = useState<RenderCredentials | null>(null);

  const [codeProvider, setCodeProvider] = useState<CodeProvider>("github");

  const [githubInstallationId, setGithubInstallationId] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubSelection, setGithubSelection] = useState<GithubSelection | null>(null);

  const [gitlabConnectionId, setGitlabConnectionId] = useState<string | null>(null);
  const [gitlabError, setGitlabError] = useState<string | null>(null);
  const [gitlabSelection, setGitlabSelection] = useState<GitlabSelection | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const canOpenModal = projectName.trim().length > 0;

  const handleCreateProject = async () => {
    if (!provider) return;

    setCreating(true);
    setCreateError(null);

    try {
      const res = await apiFetch(`/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          railway: provider === "railway" ? railwayCredentials : undefined,
          render: provider === "render" ? renderCredentials : undefined,
          github: codeProvider === "github" ? githubSelection : undefined,
          gitlab: codeProvider === "gitlab" ? gitlabSelection : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

      setCreatedProjectId(data.project.id);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setCreating(false);
    }
  };

  if (createdProjectId) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">Projet créé ✓</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            La collecte des logs a démarré. Vous pouvez maintenant accéder au projet.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/projects/${createdProjectId}`)}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Aller au projet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Ajouter un projet</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Renseignez les informations ci-dessous, puis cliquez sur « Créer le projet » à la fin — rien n&apos;est
          connecté avant cette dernière étape.
        </p>
      </div>

      <SettingsSection title="Nom du projet" description="Comment voulez-vous appeler ce projet dans Argos AI ?">
        <TextInput
          label="Nom du projet"
          id="project-name"
          placeholder="ex: Argos API"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </SettingsSection>

      <SettingsSection
        title="Hébergement"
        description="Choisissez l'hébergeur qui fait tourner ce projet, pour la collecte des logs."
      >
        <div className="flex flex-wrap gap-3">
          <ProviderConnectButton
            provider="railway"
            connected={provider === "railway"}
            disabled={!canOpenModal}
            onClick={() => setOpenProviderModal("railway")}
          />

          <ProviderConnectButton
            provider="render"
            connected={provider === "render"}
            disabled={!canOpenModal}
            onClick={() => setOpenProviderModal("render")}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Dépôt de code"
        description="Connectez votre dépôt pour permettre à l'IA de proposer des corrections sur ce projet (facultatif)."
      >
        <div className="mb-4 flex gap-2 rounded-lg bg-surface-border/5 p-1">
          <button
            type="button"
            onClick={() => setCodeProvider("github")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              codeProvider === "github" ? "bg-accent-500 text-white" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            GitHub
          </button>
          <button
            type="button"
            onClick={() => setCodeProvider("gitlab")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              codeProvider === "gitlab" ? "bg-accent-500 text-white" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            GitLab
          </button>
        </div>

        {codeProvider === "github" ? (
          <>
            {githubError && (
              <p className="mb-3 text-sm text-status-critical">
                La connexion à GitHub a échoué ({githubError}). Réessayez.
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <GithubConnectButton
                projectId={null}
                disabled={!provider}
                onResult={(result) => {
                  if ("error" in result) {
                    setGithubError(result.error);
                  } else {
                    setGithubError(null);
                    setGithubInstallationId(result.installationId);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-surface-border/10 px-4 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {githubSelection ? `GitHub connecté ✓ (${githubSelection.repoFullName})` : "Connecter GitHub"}
              </GithubConnectButton>
            </div>

            {githubInstallationId && !githubSelection && (
              <GithubRepoPicker
                installationId={githubInstallationId}
                onSaved={(repoFullName, branch) =>
                  setGithubSelection({ installationId: githubInstallationId, repoFullName, branch })
                }
              />
            )}
          </>
        ) : (
          <>
            {gitlabError && (
              <p className="mb-3 text-sm text-status-critical">
                La connexion à GitLab a échoué ({gitlabError}). Réessayez.
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <GitlabConnectButton
                disabled={!provider}
                onResult={(result) => {
                  if ("error" in result) {
                    setGitlabError(result.error);
                  } else {
                    setGitlabError(null);
                    setGitlabConnectionId(result.connectionId);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-surface-border/10 px-4 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {gitlabSelection ? `GitLab connecté ✓ (${gitlabSelection.repoFullPath})` : "Connecter GitLab"}
              </GitlabConnectButton>
            </div>

            {gitlabConnectionId && !gitlabSelection && (
              <GitlabRepoPicker
                connectionId={gitlabConnectionId}
                onSaved={(project, branch) =>
                  setGitlabSelection({
                    connectionId: gitlabConnectionId,
                    gitlabProjectId: project.id,
                    repoFullPath: project.fullPath,
                    branch,
                  })
                }
              />
            )}
          </>
        )}
      </SettingsSection>

      {createError && <p className="text-sm text-status-critical">{createError}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCreateProject}
          disabled={!provider || creating}
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Création en cours..." : "Créer le projet"}
        </button>
      </div>

      <Modal open={openProviderModal === "railway"} onClose={() => setOpenProviderModal(null)} title="Connecter Railway">
        <RailwayConnectForm
          onConfirm={(credentials) => {
            setRailwayCredentials(credentials);
            setRenderCredentials(null);
            setProvider("railway");
            setOpenProviderModal(null);
          }}
        />
      </Modal>

      <Modal open={openProviderModal === "render"} onClose={() => setOpenProviderModal(null)} title="Connecter Render">
        <RenderConnectForm
          onConfirm={(credentials) => {
            setRenderCredentials(credentials);
            setRailwayCredentials(null);
            setProvider("render");
            setOpenProviderModal(null);
          }}
        />
      </Modal>
    </div>
  );
}

function RailwayConnectForm({ onConfirm }: { onConfirm: (credentials: RailwayCredentials) => void }) {
  const [projectToken, setProjectToken] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ projectToken, serviceId, environmentId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-ink-secondary">
        Récupérez ces informations depuis votre projet Railway : Project Settings → Tokens pour le token, et l&apos;URL
        du service pour les identifiants. Elles ne seront vérifiées qu&apos;à la création finale du projet.
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

      <button
        type="submit"
        disabled={!projectToken || !serviceId || !environmentId}
        className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Valider ces informations
      </button>
    </form>
  );
}

type RenderService = {
  id: string;
  name: string;
  ownerId: string;
  type: string;
};

type StoredRenderApiKey = {
  id: string;
  label: string;
  lastFour: string;
};

function RenderConnectForm({ onConfirm }: { onConfirm: (credentials: RenderCredentials) => void }) {
  const [keySource, setKeySource] = useState<"stored" | "new">("new");
  const [storedKeys, setStoredKeys] = useState<StoredRenderApiKey[] | null>(null);
  const [loadingStoredKeys, setLoadingStoredKeys] = useState(true);
  const [selectedStoredKeyId, setSelectedStoredKeyId] = useState("");

  const [newApiKey, setNewApiKey] = useState("");
  const [newApiKeyLabel, setNewApiKeyLabel] = useState("");
  const [saveNewKey, setSaveNewKey] = useState(true);

  const [mode, setMode] = useState<"list" | "manual">("list");
  const [services, setServices] = useState<RenderService[] | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [manualOwnerId, setManualOwnerId] = useState("");
  const [manualResourceId, setManualResourceId] = useState("");

  useEffect(() => {
    apiFetch("/api/render-api-keys")
      .then((res) => res.json())
      .then((data) => {
        setStoredKeys(data.keys ?? []);
        if (data.keys?.length > 0) {
          setKeySource("stored");
          setSelectedStoredKeyId(data.keys[0].id);
        }
      })
      .catch((err) => console.error("Erreur lors du chargement des clés Render enregistrées :", err))
      .finally(() => setLoadingStoredKeys(false));
  }, []);

  const usingStoredKey = keySource === "stored" && !!selectedStoredKeyId;

  const handleFetchServices = async (query: string) => {
    setLoadingServices(true);
    setServicesError(null);
    setServices(null);
    setSelectedServiceId("");

    try {
      const res = await apiFetch(`/api/integrations/render/services?${query}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

      setServices(data.services);
    } catch (err) {
      setServicesError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingServices(false);
    }
  };

  // Dès qu'une clé déjà stockée est sélectionnée, on charge automatiquement la liste des
  // services accessibles à cette clé (déchiffrée côté serveur, jamais renvoyée au client).
  useEffect(() => {
    if (usingStoredKey) {
      handleFetchServices(`apiKeyId=${encodeURIComponent(selectedStoredKeyId)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingStoredKey, selectedStoredKeyId]);

  const selectedService = services?.find((s) => s.id === selectedServiceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ownerId = !usingStoredKey && mode === "manual" ? manualOwnerId : selectedService?.ownerId;
    const resourceId = !usingStoredKey && mode === "manual" ? manualResourceId : selectedService?.id;
    if (!ownerId || !resourceId) return;

    if (usingStoredKey) {
      onConfirm({ apiKeyId: selectedStoredKeyId, ownerId, resourceId });
    } else {
      onConfirm({
        newApiKey,
        newApiKeyLabel: saveNewKey ? newApiKeyLabel || undefined : undefined,
        ownerId,
        resourceId,
      });
    }
  };

  const canSubmit = usingStoredKey
    ? !!selectedService
    : !newApiKey.trim()
      ? false
      : mode === "manual"
        ? !!manualOwnerId && !!manualResourceId
        : !!selectedService;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!loadingStoredKeys && storedKeys && storedKeys.length > 0 && (
        <div className="flex gap-2 rounded-lg bg-surface-border/5 p-1">
          <button
            type="button"
            onClick={() => setKeySource("stored")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              keySource === "stored" ? "bg-accent-500 text-white" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Clé déjà enregistrée
          </button>
          <button
            type="button"
            onClick={() => setKeySource("new")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              keySource === "new" ? "bg-accent-500 text-white" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Nouvelle clé
          </button>
        </div>
      )}

      {usingStoredKey ? (
        <>
          <SelectField
            label="Clé API"
            id="render-stored-key-select"
            value={selectedStoredKeyId}
            onChange={(e) => setSelectedStoredKeyId(e.target.value)}
          >
            {storedKeys?.map((key) => (
              <option key={key.id} value={key.id}>
                {key.label} (••••{key.lastFour})
              </option>
            ))}
          </SelectField>

          {loadingServices && <p className="text-sm text-ink-secondary">Chargement des services...</p>}

          {servicesError && <p className="text-sm text-status-critical">{servicesError}</p>}

          {services && services.length === 0 && (
            <p className="text-sm text-ink-secondary">Aucun service trouvé sur ce compte Render.</p>
          )}

          {services && services.length > 0 && (
            <SelectField
              label="Service"
              id="render-stored-service-select"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              <option value="">Sélectionnez un service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.type})
                </option>
              ))}
            </SelectField>
          )}
        </>
      ) : (
        <>
          <p className="text-xs text-ink-secondary">
            Récupérez votre clé API depuis Account Settings → API Keys sur Render. Elle ne sera vérifiée qu&apos;à
            la création finale du projet.
          </p>

          <TextInput
            label="Clé API"
            id="render-api-key"
            type="password"
            placeholder="Collez votre clé API Render"
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-xs text-ink-secondary">
            <input type="checkbox" checked={saveNewKey} onChange={(e) => setSaveNewKey(e.target.checked)} />
            Enregistrer cette clé pour ne plus avoir à la ressaisir (chiffrée, révocable à tout moment dans les
            paramètres)
          </label>

          {saveNewKey && (
            <TextInput
              label="Nom de la clé (facultatif)"
              id="render-new-key-label"
              placeholder="ex: Compte perso"
              value={newApiKeyLabel}
              onChange={(e) => setNewApiKeyLabel(e.target.value)}
            />
          )}

          <div className="flex gap-2 rounded-lg bg-surface-border/5 p-1">
            <button
              type="button"
              onClick={() => setMode("list")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                mode === "list" ? "bg-accent-500 text-white" : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Choisir dans la liste
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                mode === "manual" ? "bg-accent-500 text-white" : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Saisir un seul service
            </button>
          </div>

          {mode === "list" ? (
            <>
              <button
                type="button"
                onClick={() => handleFetchServices(`apiKey=${encodeURIComponent(newApiKey)}`)}
                disabled={!newApiKey.trim() || loadingServices}
                className="w-full rounded-lg border border-surface-border/10 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingServices ? "Chargement..." : "Charger mes services"}
              </button>

              {servicesError && <p className="text-sm text-status-critical">{servicesError}</p>}

              {services && services.length === 0 && (
                <p className="text-sm text-ink-secondary">Aucun service trouvé sur ce compte Render.</p>
              )}

              {services && services.length > 0 && (
                <SelectField
                  label="Service"
                  id="render-service-select"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                >
                  <option value="">Sélectionnez un service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.type})
                    </option>
                  ))}
                </SelectField>
              )}
            </>
          ) : (
            <>
              <TextInput
                label="Owner ID"
                id="render-manual-owner-id"
                placeholder="ex: tea-xxxxxxxxxxxxxxxxxxxx"
                value={manualOwnerId}
                onChange={(e) => setManualOwnerId(e.target.value)}
                required
              />
              <TextInput
                label="Resource ID (service)"
                id="render-manual-resource-id"
                placeholder="ex: srv-xxxxxxxxxxxxxxxxxxxx"
                value={manualResourceId}
                onChange={(e) => setManualResourceId(e.target.value)}
                required
              />
            </>
          )}
        </>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Valider ces informations
      </button>
    </form>
  );
}

function ProviderConnectButton({
  provider,
  connected,
  disabled,
  onClick,
}: {
  provider: HostingProvider;
  connected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const brand = PROVIDER_BRAND[provider];
  const [hovered, setHovered] = useState(false);
  const Logo = brand.Logo;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={disabled ? "Renseignez d'abord un nom de projet" : undefined}
      style={{
        backgroundColor: disabled ? undefined : hovered ? brand.hoverColor : brand.color,
        color: disabled ? undefined : brand.textColor,
      }}
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-surface-border/10 disabled:text-ink-muted disabled:opacity-50"
    >
      <Logo className="h-4 w-4" />
      {connected ? `${brand.label} sélectionné ✓` : `Connecter ${brand.label}`}
    </button>
  );
}

function GithubRepoPicker({
  installationId,
  onSaved,
}: {
  installationId: string;
  onSaved: (repoFullName: string, branch: string) => void;
}) {
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);

  const [selectedRepoFullName, setSelectedRepoFullName] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    apiFetch(`/api/integrations/github/repos?installationId=${installationId}`)
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

    apiFetch(`/api/integrations/github/branches?installationId=${installationId}&owner=${owner}&repo=${repo}`)
      .then((res) => res.json())
      .then((data) => {
        setBranches(data.branches ?? []);
        setSelectedBranch(selectedRepo.defaultBranch);
      })
      .catch((err) => console.error("Erreur lors du chargement des branches :", err))
      .finally(() => setLoadingBranches(false));
  }, [selectedRepo, installationId]);

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

          <button
            type="button"
            onClick={() => selectedRepoFullName && selectedBranch && onSaved(selectedRepoFullName, selectedBranch)}
            disabled={!selectedRepoFullName || !selectedBranch}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Associer ce dépôt
          </button>
        </>
      )}
    </div>
  );
}

function GitlabRepoPicker({
  connectionId,
  onSaved,
}: {
  connectionId: string;
  onSaved: (project: GitlabProject, branch: string) => void;
}) {
  const [projects, setProjects] = useState<GitlabProject[] | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    apiFetch(`/api/integrations/gitlab/projects?connectionId=${connectionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Erreur inconnue");
        return res.json();
      })
      .then((data) => setProjects(data.projects))
      .catch((err) => setProjectsError(err.message))
      .finally(() => setLoadingProjects(false));
  }, [connectionId]);

  const selectedProject = projects?.find((p) => String(p.id) === selectedProjectId);

  useEffect(() => {
    if (!selectedProject) return;

    setLoadingBranches(true);
    setBranches([]);

    apiFetch(`/api/integrations/gitlab/branches?connectionId=${connectionId}&gitlabProjectId=${selectedProject.id}`)
      .then((res) => res.json())
      .then((data) => {
        setBranches(data.branches ?? []);
        setSelectedBranch(selectedProject.defaultBranch);
      })
      .catch((err) => console.error("Erreur lors du chargement des branches :", err))
      .finally(() => setLoadingBranches(false));
  }, [selectedProject, connectionId]);

  return (
    <div className="mt-4 space-y-4 border-t border-surface-border/10 pt-4">
      {loadingProjects && <p className="text-sm text-ink-secondary">Chargement des projets...</p>}
      {projectsError && <p className="text-sm text-status-critical">{projectsError}</p>}

      {projects && projects.length === 0 && (
        <p className="text-sm text-ink-secondary">Aucun projet GitLab accessible avec ce compte.</p>
      )}

      {projects && projects.length > 0 && (
        <>
          <SelectField
            label="Projet"
            id="new-project-gitlab-repo"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Sélectionnez un projet</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.fullPath}
              </option>
            ))}
          </SelectField>

          {selectedProject && (
            <SelectField
              label="Branche"
              id="new-project-gitlab-branch"
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

          <button
            type="button"
            onClick={() => selectedProject && selectedBranch && onSaved(selectedProject, selectedBranch)}
            disabled={!selectedProject || !selectedBranch}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Associer ce dépôt
          </button>
        </>
      )}
    </div>
  );
}
