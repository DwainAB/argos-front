import Link from "next/link";
import { SignupCard } from "@/components/auth/SignupCard";

export default function SignupChoicePage() {
  return (
    <SignupCard subtitle="Créez votre compte pour surveiller vos projets">
      <div className="space-y-3">
        <Link
          href="/signup/personal"
          className="block rounded-xl border border-surface-border/10 bg-surface-raised/90 p-5 shadow-2xl shadow-accent-500/5 backdrop-blur transition hover:border-accent-500/30"
        >
          <p className="text-sm font-medium text-ink-primary">Compte personnel</p>
          <p className="mt-1 text-xs text-ink-secondary">
            Pour surveiller vos propres projets, seul.
          </p>
        </Link>

        <Link
          href="/signup/organization"
          className="block rounded-xl border border-surface-border/10 bg-surface-raised/90 p-5 shadow-2xl shadow-accent-500/5 backdrop-blur transition hover:border-accent-500/30"
        >
          <p className="text-sm font-medium text-ink-primary">Compte organisation</p>
          <p className="mt-1 text-xs text-ink-secondary">
            Pour partager vos projets avec les membres de votre équipe.
          </p>
        </Link>
      </div>
    </SignupCard>
  );
}
