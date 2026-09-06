import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { CircuitBackground } from "@/components/landing/CircuitBackground";

// Décor commun aux écrans d'inscription (choix du type de compte, puis chacun des deux
// formulaires) : fond, logo, titre, lien "déjà un compte ?".
export function SignupCard({ subtitle, children }: { subtitle: string; children: ReactNode }) {
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
          <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
        </Link>

        {children}

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
