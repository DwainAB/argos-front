"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { CircuitBackground } from "@/components/landing/CircuitBackground";
import { ApiAuthError, signup } from "@/lib/auth";

export default function SignupPage() {
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
      await signup({ firstName, lastName, email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiAuthError ? err.message : "Impossible de créer le compte.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Décor de fond, cohérent avec la landing page et le login. */}
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
          <p className="mt-1 text-sm text-ink-secondary">
            Créez votre compte pour surveiller vos projets
          </p>
        </Link>

        <div className="rounded-xl border border-surface-border/10 bg-surface-raised/90 p-6 shadow-2xl shadow-accent-500/5 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
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
                  className="w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                />
              </div>
            </div>

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

            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-ink-secondary">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
              />
              <p className="mt-1.5 text-xs text-ink-muted">8 caractères minimum.</p>
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

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-accent-400 hover:text-accent-300">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
