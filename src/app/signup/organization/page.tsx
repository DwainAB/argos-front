"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupCard } from "@/components/auth/SignupCard";
import { SignupFields } from "@/components/auth/SignupFields";
import { ApiAuthError, signup } from "@/lib/auth";

export default function OrganizationSignupPage() {
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signup({ firstName, lastName, email, password, accountType: "organization", organizationName });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiAuthError ? err.message : "Impossible de créer le compte.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SignupCard subtitle="Créez le compte de votre organisation">
      <div className="rounded-xl border border-surface-border/10 bg-surface-raised/90 p-6 shadow-2xl shadow-accent-500/5 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="organizationName" className="mb-1 block text-sm text-ink-secondary">
              Nom de l'organisation
            </label>
            <input
              id="organizationName"
              type="text"
              required
              placeholder="ex: Studio des Parfums"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            />
          </div>

          <SignupFields
            firstName={firstName}
            onFirstNameChange={setFirstName}
            lastName={lastName}
            onLastNameChange={setLastName}
            email={email}
            onEmailChange={setEmail}
            password={password}
            onPasswordChange={setPassword}
          />

          {error && <p className="text-sm text-status-critical">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-surface shadow-lg shadow-accent-500/20 transition hover:bg-accent-400 hover:shadow-accent-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer le compte organisation"}
          </button>
        </form>
      </div>
    </SignupCard>
  );
}
