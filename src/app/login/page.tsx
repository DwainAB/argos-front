"use client";

import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { GithubIcon } from "@/components/icons/GithubIcon";

export default function LoginPage() {
  const router = useRouter();

  // Pour l'instant, aucune vérification réelle : on redirige simplement vers le dashboard.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const handleOAuthClick = () => {
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path
                d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-ink-primary">Argos AI</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Connectez-vous pour surveiller vos projets
          </p>
        </div>

        <div className="rounded-xl border border-surface-border/10 bg-surface-raised p-6 shadow-xl">
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
                className="w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
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
                placeholder="••••••••"
                className="w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-surface transition hover:bg-accent-400"
            >
              Connexion
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
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border/10 bg-surface py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5"
            >
              <GoogleIcon className="h-4 w-4" />
              Continuer avec Google
            </button>

            <button
              type="button"
              onClick={handleOAuthClick}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border/10 bg-surface py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5"
            >
              <GithubIcon className="h-4 w-4" />
              Continuer avec GitHub
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Pas encore de compte ?{" "}
          <a href="#" className="text-accent-400 hover:text-accent-300">
            Créer un compte
          </a>
        </p>
      </div>
    </main>
  );
}
