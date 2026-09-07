"use client";

import { useState } from "react";
import { useCurrentUser } from "@/components/dashboard/UserContext";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { TextInput, SelectField } from "@/components/dashboard/FormField";
import { apiFetch } from "@/lib/api-fetch";
import { useOrganization, type OrganizationMember } from "@/lib/use-organization";

function RoleBadge({ role }: { role: "admin" | "user" }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        role === "admin" ? "bg-accent-500/10 text-accent-400" : "bg-surface-border/10 text-ink-secondary"
      }`}
    >
      {role === "admin" ? "Admin" : "Membre"}
    </span>
  );
}

function AddMemberForm({ onAdded }: { onAdded: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch("/api/organizations/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

      setEmail("");
      setRole("user");
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ajouter ce membre.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <TextInput
          label="Email"
          id="member-email"
          type="email"
          placeholder="jean@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="w-36">
        <SelectField label="Rôle" id="member-role" value={role} onChange={(e) => setRole(e.target.value as "admin" | "user")}>
          <option value="user">Membre</option>
          <option value="admin">Admin</option>
        </SelectField>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Ajout..." : "Ajouter"}
      </button>
      {error && <p className="text-sm text-status-critical">{error}</p>}
    </form>
  );
}

function MembersSection({
  members,
  myUserId,
  isAdmin,
  onChanged,
}: {
  members: OrganizationMember[];
  myUserId: string;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const handleRemove = async (userId: string) => {
    try {
      const res = await apiFetch(`/api/organizations/members/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur inconnue");
      onChanged();
    } catch (err) {
      console.error(`Erreur lors du retrait du membre ${userId} :`, err);
    }
  };

  const handleRoleChange = async (userId: string, role: "admin" | "user") => {
    try {
      const res = await apiFetch(`/api/organizations/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Erreur inconnue");
      onChanged();
    } catch (err) {
      console.error(`Erreur lors du changement de rôle du membre ${userId} :`, err);
    }
  };

  return (
    <SettingsSection
      title="Membres"
      description={isAdmin ? "Gérez les membres de votre organisation et leurs rôles." : "Membres de votre organisation."}
    >
      <ul className="mb-4 space-y-2">
        {members.map((member) => (
          <li
            key={member.userId}
            className="flex items-center justify-between rounded-lg border border-surface-border/10 bg-surface px-3 py-2"
          >
            <div>
              <p className="text-sm text-ink-primary">
                {member.firstName} {member.lastName}
                {member.userId === myUserId && <span className="ml-2 text-xs text-ink-muted">(vous)</span>}
              </p>
              <p className="text-xs text-ink-muted">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.userId, e.target.value as "admin" | "user")}
                  disabled={member.userId === myUserId}
                  className="rounded-lg border border-surface-border/10 bg-surface px-2 py-1 text-xs text-ink-primary outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="user">Membre</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <RoleBadge role={member.role} />
              )}
              {isAdmin && member.userId !== myUserId && (
                <button
                  type="button"
                  onClick={() => handleRemove(member.userId)}
                  className="text-xs text-status-critical hover:underline"
                >
                  Retirer
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {isAdmin && <AddMemberForm onAdded={onChanged} />}
    </SettingsSection>
  );
}

function InvitationsSection({
  invitations,
  onChanged,
}: {
  invitations: { id: string; email: string; role: "admin" | "user" }[];
  onChanged: () => void;
}) {
  if (invitations.length === 0) return null;

  const handleCancel = async (invitationId: string) => {
    try {
      const res = await apiFetch(`/api/organizations/invitations/${invitationId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur inconnue");
      onChanged();
    } catch (err) {
      console.error(`Erreur lors de l'annulation de l'invitation ${invitationId} :`, err);
    }
  };

  return (
    <SettingsSection title="Invitations en attente" description="Ces personnes rejoindront l'organisation dès qu'elles créeront leur compte.">
      <ul className="space-y-2">
        {invitations.map((invitation) => (
          <li
            key={invitation.id}
            className="flex items-center justify-between rounded-lg border border-surface-border/10 bg-surface px-3 py-2"
          >
            <div>
              <p className="text-sm text-ink-primary">{invitation.email}</p>
              <p className="text-xs text-ink-muted">En attente d'inscription</p>
            </div>
            <div className="flex items-center gap-3">
              <RoleBadge role={invitation.role} />
              <button
                type="button"
                onClick={() => handleCancel(invitation.id)}
                className="text-xs text-status-critical hover:underline"
              >
                Annuler
              </button>
            </div>
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}

export function OrganizationContent() {
  const user = useCurrentUser();
  const { organization, loading, error, refetch } = useOrganization();

  if (user.accountType !== "organization") {
    return (
      <div className="p-6">
        <SettingsSection title="Organisation" description="Cette page est réservée aux comptes organisation.">
          <p className="text-sm text-ink-secondary">
            Vous utilisez un compte personnel. Pour gérer une organisation (membres, rôles, facturation), un compte
            organisation est nécessaire.
          </p>
        </SettingsSection>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-sm text-ink-secondary">Chargement...</div>;
  }

  if (error || !organization) {
    return (
      <div className="p-6">
        <SettingsSection title="Organisation" description="Impossible de charger votre organisation.">
          <p className="text-sm text-status-critical">{error ?? "Organisation introuvable."}</p>
        </SettingsSection>
      </div>
    );
  }

  const isAdmin = organization.myRole === "admin";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">{organization.name}</h1>
        <p className="text-sm text-ink-secondary">Gestion des membres de l'organisation.</p>
      </div>

      <MembersSection members={organization.members} myUserId={user.id} isAdmin={isAdmin} onChanged={refetch} />
      {isAdmin && <InvitationsSection invitations={organization.invitations} onChanged={refetch} />}
    </div>
  );
}
