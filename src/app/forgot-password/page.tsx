"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { CircuitBackground } from "@/components/landing/CircuitBackground";
import { ApiAuthError, forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await forgotPassword(email);
      // Message générique côté backend : ne révèle jamais si l'email correspond à un
      // compte existant, on l'affiche donc tel quel sans le personnaliser davantage.
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiAuthError ? err.message : "Impossible de traiter cette demande.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{ maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent 100%)" }}
        >
          <CircuitBackground />
        </div>
        <div className="absolute left-1/2 top-1/4 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center text-center">
          <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
            <Logo className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-semibold text-ink-primary">Argos AI</h1>
          <p className="mt-1 text-sm text-ink-secondary">Réinitialisez votre mot de passe</p>
        </Link>

        <div className="rounded-xl border border-surface-border/10 bg-surface-raised/90 p-6 shadow-2xl shadow-accent-500/5 backdrop-blur">
          {sent ? (
            <p className="text-sm text-ink-secondary">
              Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé. Pensez à vérifier
              vos spams.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-ink-secondary">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                />
              </div>

              {error && <p className="text-sm text-status-critical">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-surface shadow-lg shadow-accent-500/20 transition hover:bg-accent-400 hover:shadow-accent-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          <Link href="/login" className="text-accent-400 hover:text-accent-300">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
