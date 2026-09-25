"use client";

import { useEffect, useState } from "react";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { TextInput, SelectField } from "@/components/dashboard/FormField";
import { Modal } from "@/components/dashboard/Modal";
import { useCurrentUser } from "@/components/dashboard/UserContext";
import { ApiAuthError, changePassword, updatePhone } from "@/lib/auth";
import { apiFetch } from "@/lib/api-fetch";

export default function AccountSettingsPage() {
  const user = useCurrentUser();

  const [language, setLanguage] = useState("fr");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSaved, setPhoneSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiAuthError ? err.message : "Impossible de mettre à jour le mot de passe.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneSaving(true);
    setPhoneError(null);
    setPhoneSaved(false);

    try {
      await updatePhone(phone);
      setPhoneSaved(true);
    } catch (err) {
      setPhoneError(err instanceof ApiAuthError ? err.message : "Impossible d'enregistrer ce numéro.");
    } finally {
      setPhoneSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Paramètres du compte</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Gérez vos préférences personnelles et vos informations de connexion.
        </p>
      </div>

      <SettingsSection title="Thème" description="Choisissez l'apparence de l'interface.">
        <ThemeToggle />
      </SettingsSection>

      <SettingsSection title="Langue" description="Langue utilisée dans l'interface.">
        <form onSubmit={handleLanguageSubmit} className="flex items-end gap-3">
          <div className="w-48">
            <SelectField
              label="Langue"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </SelectField>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Enregistrer
          </button>
        </form>
      </SettingsSection>

      <SettingsSection title="Mot de passe" description="Modifiez le mot de passe de votre compte.">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <TextInput
            label="Mot de passe actuel"
            id="current-password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordSaved(false);
            }}
          />
          <TextInput
            label="Nouveau mot de passe"
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordSaved(false);
            }}
          />
          <TextInput
            label="Confirmer le nouveau mot de passe"
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordSaved(false);
            }}
          />
          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passwordSaving ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </form>
        {passwordError && <p className="mt-2 text-sm text-status-critical">{passwordError}</p>}
        {passwordSaved && !passwordError && (
          <p className="mt-2 text-sm text-status-good">Mot de passe mis à jour.</p>
        )}
      </SettingsSection>

      <SettingsSection
        title="Numéro de téléphone"
        description="Utilisé pour l'envoi des notifications par SMS. Format international requis, ex. +33612345678."
      >
        <form onSubmit={handlePhoneSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <TextInput
              label="Numéro de téléphone"
              id="phone"
              type="tel"
              placeholder="+33612345678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneSaved(false);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={phoneSaving}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {phoneSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
        {phoneError && <p className="mt-2 text-sm text-status-critical">{phoneError}</p>}
        {phoneSaved && !phoneError && <p className="mt-2 text-sm text-status-good">Numéro enregistré.</p>}
      </SettingsSection>

      <RenderApiKeysSection />

      <GithubConnectionsSection />
    </div>
  );
}

type RenderApiKey = {
  id: string;
  label: string;
  lastFour: string;
  createdAt: string;
};

function RenderApiKeysSection() {
  const [keys, setKeys] = useState<RenderApiKey[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<RenderApiKey | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadKeys = () => {
    setLoading(true);
    apiFetch("/api/render-api-keys")
      .then((res) => res.json())
      .then((data) => setKeys(data.keys ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleDelete = async () => {
    if (!keyToDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await apiFetch(`/api/render-api-keys/${keyToDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur inconnue");
      }
      setKeyToDelete(null);
      loadKeys();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Impossible de supprimer cette clé.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SettingsSection
      title="Clés API Render"
      description="Clés enregistrées une fois pour connecter vos projets Render sans les ressaisir. Jamais affichées en clair."
    >
      {loading && <p className="text-sm text-ink-secondary">Chargement...</p>}
      {error && <p className="text-sm text-status-critical">{error}</p>}

      {keys && keys.length === 0 && (
        <p className="text-sm text-ink-secondary">
          Aucune clé enregistrée. Vous pouvez en ajouter une lors de la connexion d&apos;un projet Render.
        </p>
      )}

      {keys && keys.length > 0 && (
        <ul className="space-y-2">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex items-center justify-between rounded-lg border border-surface-border/10 px-3 py-2"
            >
              <div>
                <p className="text-sm text-ink-primary">{key.label}</p>
                <p className="text-xs text-ink-secondary">••••{key.lastFour}</p>
              </div>
              <button
                type="button"
                onClick={() => setKeyToDelete(key)}
                className="text-sm text-status-critical hover:underline"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!keyToDelete} onClose={() => setKeyToDelete(null)} title="Supprimer cette clé API ?">
        <div className="space-y-4">
          <p className="text-sm text-ink-secondary">
            Argos AI n&apos;aura plus accès à cette clé (« {keyToDelete?.label} »). Les projets Render qui l&apos;utilisent
            encore doivent être supprimés ou déconnectés au préalable.
          </p>
          {deleteError && <p className="text-sm text-status-critical">{deleteError}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setKeyToDelete(null)}
              className="rounded-lg border border-surface-border/10 px-4 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-status-critical px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </Modal>
    </SettingsSection>
  );
}

type GithubConnection = {
  installationId: number;
  accountLogin: string;
  accountAvatarUrl: string;
  projects: { id: string; name: string; githubRepo: string | null }[];
};

function GithubConnectionsSection() {
  const [connections, setConnections] = useState<GithubConnection[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionToRevoke, setConnectionToRevoke] = useState<GithubConnection | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const loadConnections = () => {
    setLoading(true);
    apiFetch("/api/github-connections")
      .then((res) => res.json())
      .then((data) => setConnections(data.connections ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleRevoke = async () => {
    if (!connectionToRevoke) return;

    setRevoking(true);
    setRevokeError(null);

    try {
      const res = await apiFetch(`/api/github-connections/${connectionToRevoke.installationId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur inconnue");
      }
      setConnectionToRevoke(null);
      loadConnections();
    } catch (err) {
      setRevokeError(err instanceof Error ? err.message : "Impossible de déconnecter ce compte.");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <SettingsSection
      title="Connexions GitHub"
      description="Comptes/organisations GitHub auxquels Argos AI a accès, via les dépôts connectés à vos projets."
    >
      {loading && <p className="text-sm text-ink-secondary">Chargement...</p>}
      {error && <p className="text-sm text-status-critical">{error}</p>}

      {connections && connections.length === 0 && (
        <p className="text-sm text-ink-secondary">Aucun dépôt GitHub connecté pour le moment.</p>
      )}

      {connections && connections.length > 0 && (
        <ul className="space-y-3">
          {connections.map((connection) => (
            <li key={connection.installationId} className="rounded-lg border border-surface-border/10 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {connection.accountAvatarUrl && (
                    <img src={connection.accountAvatarUrl} alt="" className="h-6 w-6 rounded-full" />
                  )}
                  <span className="text-sm text-ink-primary">{connection.accountLogin}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConnectionToRevoke(connection)}
                  className="text-sm text-status-critical hover:underline"
                >
                  Déconnecter
                </button>
              </div>
              <ul className="mt-2 space-y-1 pl-9">
                {connection.projects.map((project) => (
                  <li key={project.id} className="text-xs text-ink-secondary">
                    {project.name} {project.githubRepo ? `— ${project.githubRepo}` : ""}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!connectionToRevoke}
        onClose={() => setConnectionToRevoke(null)}
        title="Déconnecter ce compte GitHub ?"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-secondary">
            Argos AI n&apos;aura plus accès au code de « {connectionToRevoke?.accountLogin} » — les corrections IA
            ne seront plus proposées pour les projets concernés ({connectionToRevoke?.projects.map((p) => p.name).join(", ")}
            ). La GitHub App reste installée sur GitHub : pour révoquer l&apos;accès complètement, désinstallez-la
            depuis github.com/settings/installations.
          </p>
          {revokeError && <p className="text-sm text-status-critical">{revokeError}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConnectionToRevoke(null)}
              className="rounded-lg border border-surface-border/10 px-4 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleRevoke}
              disabled={revoking}
              className="rounded-lg bg-status-critical px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {revoking ? "Déconnexion..." : "Déconnecter"}
            </button>
          </div>
        </div>
      </Modal>
    </SettingsSection>
  );
}
