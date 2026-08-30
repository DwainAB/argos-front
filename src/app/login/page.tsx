"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { CircuitBackground } from "@/components/landing/CircuitBackground";
import { ApiAuthError, login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiAuthError ? err.message : "Impossible de vous connecter.");
    } finally {
      setSubmitting(false);
    }
  };

  // Connexion Google/GitHub à venir — pas encore branchée sur une vraie authentification.
  const handleOAuthClick = () => {
    router.push("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Décor de fond, cohérent avec la landing page. */}
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
            Connectez-vous pour surveiller vos projets
          </p>
        </Link>

        <div className="rounded-xl border border-surface-border/10 bg-surface-raised/90 p-6 shadow-2xl shadow-accent-500/5 backdrop-blur">
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

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm text-ink-secondary">
                  Mot de passe
                </label>
                <a href="#" className="text-xs text-accent-400 hover:text-accent-300">
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
              />
            </div>

            {error && <p className="text-sm text-status-critical">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-surface shadow-lg shadow-accent-500/20 transition hover:bg-accent-400 hover:shadow-accent-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Connexion..." : "Connexion"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-surface-border/10" />
            <span className="text-xs text-ink-muted">ou</span>
            <div className="h-px flex-1 bg-surface-border/10" />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleOAuthClick}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border/10 bg-surface py-2 text-sm font-medium text-ink-primary transition hover:border-accent-500/30 hover:bg-surface-border/5"
            >
              <GoogleIcon className="h-4 w-4" />
              Continuer avec Google
            </button>

            <button
              type="button"
              onClick={handleOAuthClick}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border/10 bg-surface py-2 text-sm font-medium text-ink-primary transition hover:border-accent-500/30 hover:bg-surface-border/5"
            >
              <GithubIcon className="h-4 w-4" />
              Continuer avec GitHub
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-accent-400 hover:text-accent-300">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
