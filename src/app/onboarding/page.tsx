"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { AuthCard } from "@/components/auth/AuthCard";
import { ApiAuthError, completeOnboarding, getCurrentUser, OnboardingRequiredError, type AccountType } from "@/lib/auth";

const inputClassName =
  "w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500";

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  { value: "personal", label: "Compte personnel", description: "Pour surveiller vos propres projets, seul." },
  { value: "organization", label: "Compte organisation", description: "Pour partager vos projets avec les membres de votre équipe." },
];

// Étape unique après l'inscription chez Clerk : crée le compte Argos AI (type de compte,
// organisation, abonnement en attente). Prénom/nom pré-remplis depuis Clerk quand le
// fournisseur (Google, GitHub, GitLab) les a transmis.
export default function OnboardingPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [checking, setChecking] = useState(true);
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [organizationName, setOrganizationName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Un compte déjà configuré (retour arrière, lien direct) n'a rien à faire ici.
  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        if (user) {
          router.replace("/dashboard");
          return;
        }
        setChecking(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (!(err instanceof OnboardingRequiredError)) {
          console.error("Erreur lors de la vérification du compte :", err);
        }
        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;
    setFirstName((current) => current || clerkUser.firstName || "");
    setLastName((current) => current || clerkUser.lastName || "");
  }, [isLoaded, clerkUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await completeOnboarding({
        firstName,
        lastName,
        accountType,
        organizationName: accountType === "organization" ? organizationName : undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiAuthError ? err.message : "Impossible de créer le compte.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return null;
  }

  return (
    <AuthCard subtitle="Dernière étape : configurez votre compte">
      <div className="w-full rounded-xl border border-surface-border/10 bg-surface-raised/90 p-6 shadow-2xl shadow-accent-500/5 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm text-ink-secondary">Type de compte</legend>
            {ACCOUNT_TYPES.map((type) => (
              <label
                key={type.value}
                className={`block cursor-pointer rounded-lg border p-4 transition ${
                  accountType === type.value
                    ? "border-accent-500 bg-accent-500/5"
                    : "border-surface-border/10 hover:border-accent-500/30"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={type.value}
                  checked={accountType === type.value}
                  onChange={() => setAccountType(type.value)}
                  className="sr-only"
                />
                <p className="text-sm font-medium text-ink-primary">{type.label}</p>
                <p className="mt-1 text-xs text-ink-secondary">{type.description}</p>
              </label>
            ))}
          </fieldset>

          {accountType === "organization" && (
            <div>
              <label htmlFor="organizationName" className="mb-1 block text-sm text-ink-secondary">
                Nom de l&apos;organisation
              </label>
              <input
                id="organizationName"
                type="text"
                required
                placeholder="ex: Studio des Parfums"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className={inputClassName}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm text-ink-secondary">
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                required
                placeholder="Jane"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm text-ink-secondary">
                Nom
              </label>
              <input
                id="lastName"
                type="text"
                required
                placeholder="Dupont"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          {error && <p className="text-sm text-status-critical">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-surface shadow-lg shadow-accent-500/20 transition hover:bg-accent-400 hover:shadow-accent-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </div>

      {/* Mauvais compte (plusieurs comptes sur le même navigateur) : sans ce lien, impossible
          de sortir de l'onboarding pour se reconnecter avec le bon. */}
      <p className="mt-4 text-center text-xs text-ink-muted">
        Connecté en tant que <span className="text-ink-secondary">{clerkUser?.primaryEmailAddress?.emailAddress}</span>.{" "}
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="text-accent-400 hover:text-accent-300"
        >
          Ce n&apos;est pas vous ? Se déconnecter
        </button>
      </p>
    </AuthCard>
  );
}
