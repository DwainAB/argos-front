import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import {
  IconRadar,
  IconBolt,
  IconTranslate,
  IconPullRequest,
  IconCheck,
} from "@/components/icons/LandingIcons";
import { LiveLogTerminal } from "@/components/landing/LiveLogTerminal";
import { FaqSection } from "@/components/landing/FaqSection";
import { CircuitBackground } from "@/components/landing/CircuitBackground";

const features = [
  {
    icon: IconRadar,
    title: "Surveillance 24h/24, 7j/7",
    description:
      "Une IA observe vos serveurs en continu, sans interruption, pour repérer le moindre signe de défaillance avant qu'il ne devienne un incident.",
  },
  {
    icon: IconBolt,
    title: "Alertes à la seconde près",
    description:
      "Dès qu'un problème est détecté, les bonnes personnes sont prévenues instantanément par SMS ou par email — plus besoin de surveiller vous-même vos tableaux de bord.",
  },
  {
    icon: IconTranslate,
    title: "Vos logs, enfin compréhensibles",
    description:
      "Argos AI traduit chaque log technique en langage clair, pour que toute votre équipe comprenne immédiatement ce qui se passe sur vos serveurs.",
  },
  {
    icon: IconPullRequest,
    title: "Des correctifs proposés, jamais imposés",
    description:
      "Quand une erreur revient dans vos logs, Argos AI peut proposer un correctif et ouvrir une pull request sur votre dépôt GitHub. C'est vous qui décidez de la valider.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    period: "",
    description: "Pour tester Argos AI sur un premier projet.",
    features: ["1 projet surveillé", "Alertes par email", "Historique 7 jours"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "À partir de 19€",
    period: "/mois",
    description: "Pour les équipes qui veulent une tranquillité d'esprit totale.",
    features: [
      "Projets illimités",
      "Alertes SMS et email",
      "Historique illimité",
      "Traduction des logs en langage clair",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    price: "Sur devis",
    period: "",
    description: "Pour les organisations avec plusieurs équipes et environnements.",
    features: ["Tout Pro inclus", "Gestion multi-équipes", "Support prioritaire"],
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      {/* Décor de fond : circuit + glows bleus répartis sur toute la page, derrière le contenu. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{ maskImage: "linear-gradient(to bottom, black, transparent 85%)" }}
        >
          <CircuitBackground />
        </div>
        <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent-500/10 blur-[120px]" />
        <div className="absolute -left-40 top-[1100px] h-[380px] w-[380px] rounded-full bg-accent-500/[0.07] blur-[110px]" />
        <div className="absolute -right-32 top-[1900px] h-[420px] w-[420px] rounded-full bg-accent-500/[0.08] blur-[120px]" />
        <div className="absolute -left-24 top-[2700px] h-[380px] w-[380px] rounded-full bg-accent-500/[0.07] blur-[110px]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
            <Logo className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-ink-primary">Argos AI</span>
        </div>
        <Link
          href="/login"
          className="rounded-lg border border-surface-border/10 bg-surface-raised px-4 py-2 text-sm font-medium text-ink-primary transition hover:bg-surface-border/5"
        >
          Se connecter
        </Link>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-4xl px-6 pb-8 pt-16 text-center sm:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-surface-border/10 bg-surface-raised px-3 py-1 text-xs font-medium text-ink-secondary">
            <span className="animate-pulse-ring h-1.5 w-1.5 rounded-full bg-accent-400" />
            L'intelligence artificielle qui veille sur vos serveurs
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink-primary sm:text-5xl">
            Vos serveurs, sous surveillance permanente
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-secondary sm:text-lg">
            Argos AI surveille vos serveurs en continu, vous alerte à la seconde où un problème
            survient, et vous explique clairement ce qu'il se passe. Une tranquillité d'esprit
            que vous n'aviez pas encore.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/login"
              className="rounded-lg bg-accent-500 px-6 py-3 text-sm font-medium text-surface shadow-lg shadow-accent-500/20 transition hover:bg-accent-400 hover:shadow-accent-500/30"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div className="px-6 pb-20 pt-4 sm:pb-28">
          <LiveLogTerminal />
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink-primary sm:text-3xl">
            Une intelligence artificielle dédiée à vos serveurs
          </h2>
          <p className="mt-3 text-sm text-ink-secondary sm:text-base">
            Argos AI ne se contente pas de surveiller : elle comprend, elle alerte, et elle vous
            explique.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised p-6 transition hover:border-accent-500/30"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-500/0 blur-2xl transition group-hover:bg-accent-500/10" />
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-4 text-base font-semibold text-ink-primary">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-secondary">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink-primary sm:text-3xl">
            Un tarif adapté à chaque équipe
          </h2>
          <p className="mt-3 text-sm text-ink-secondary sm:text-base">
            Commencez gratuitement, évoluez quand vous en avez besoin.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col overflow-hidden rounded-xl border p-6 ${
                plan.highlighted
                  ? "border-accent-500/40 bg-surface-raised shadow-xl shadow-accent-500/10"
                  : "border-surface-border/10 bg-surface-raised"
              }`}
            >
              {plan.highlighted && (
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-500/15 blur-3xl"
                  aria-hidden="true"
                />
              )}
              {plan.highlighted && (
                <span className="relative mb-3 inline-flex w-fit items-center rounded-full bg-accent-500/10 px-2.5 py-0.5 text-xs font-medium text-accent-400">
                  Le plus populaire
                </span>
              )}
              <h3 className="relative text-base font-semibold text-ink-primary">{plan.name}</h3>
              <p className="relative mt-1 text-sm text-ink-secondary">{plan.description}</p>
              <div className="relative mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-ink-primary">{plan.price}</span>
                {plan.period && <span className="text-sm text-ink-muted">{plan.period}</span>}
              </div>

              <ul className="relative mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`relative mt-6 rounded-lg py-2 text-center text-sm font-medium transition ${
                  plan.highlighted
                    ? "bg-accent-500 text-surface hover:bg-accent-400"
                    : "border border-surface-border/10 bg-surface text-ink-primary hover:bg-surface-border/5"
                }`}
              >
                Commencer
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink-primary sm:text-3xl">
            Questions fréquentes
          </h2>
          <p className="mt-3 text-sm text-ink-secondary sm:text-base">
            Tout ce qu'il faut savoir avant de connecter vos premiers serveurs.
          </p>
        </div>

        <FaqSection />
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-500/10 text-accent-400">
              <Logo className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium text-ink-secondary">Argos AI</span>
          </div>
          <p>© {new Date().getFullYear()} Argos AI. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}
