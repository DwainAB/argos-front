"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupCard } from "@/components/auth/SignupCard";
import { SignupFields } from "@/components/auth/SignupFields";
import { ApiAuthError, signup } from "@/lib/auth";

export default function PersonalSignupPage() {
  const router = useRouter();

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
      await signup({ firstName, lastName, email, password, accountType: "personal" });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiAuthError ? err.message : "Impossible de créer le compte.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SignupCard subtitle="Créez votre compte personnel">
      <div className="rounded-xl border border-surface-border/10 bg-surface-raised/90 p-6 shadow-2xl shadow-accent-500/5 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {submitting ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </div>
    </SignupCard>
  );
}
