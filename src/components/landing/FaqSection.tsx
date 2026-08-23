"use client";

import { useState } from "react";
import { IconChevronDown } from "@/components/icons/NavIcons";

const FAQ_ITEMS = [
  {
    question: "Comment Argos AI surveille-t-il mes serveurs ?",
    answer:
      "Vous connectez vos projets GitHub et vos services hébergés (Railway pour commencer) à Argos AI. Une fois connectés, leurs logs sont collectés en continu et analysés en temps réel pour détecter erreurs et avertissements.",
  },
  {
    question: "Comment suis-je alerté en cas de problème ?",
    answer:
      "Dès qu'un problème est détecté, Argos AI notifie instantanément les personnes concernées par SMS et par email, avec une explication claire de ce qui s'est passé — pas besoin de garder un œil sur vos tableaux de bord.",
  },
  {
    question: "Qu'est-ce qui rend les logs plus compréhensibles ?",
    answer:
      "Argos AI traduit automatiquement chaque log technique en langage clair. Plus besoin d'être expert pour comprendre qu'une base de données a coupé la connexion ou qu'un service a redémarré.",
  },
  {
    question: "Quels services puis-je connecter à Argos AI ?",
    answer:
      "Vos dépôts GitHub et vos services hébergés sur Railway. D'autres hébergeurs seront pris en charge prochainement.",
  },
  {
    question: "Puis-je changer d'offre à tout moment ?",
    answer:
      "Oui. Vous pouvez passer du plan Starter au plan Pro (ou inversement) à tout moment depuis votre espace, sans engagement.",
  },
  {
    question: "Mes données et mes logs sont-ils en sécurité ?",
    answer:
      "Oui. Vos logs sont traités de façon confidentielle et ne sont jamais partagés avec des tiers. Vous gardez à tout moment le contrôle des projets connectés à Argos AI.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-surface-border/10 rounded-xl border border-surface-border/10 bg-surface-raised">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-ink-primary transition hover:text-accent-400 sm:text-base"
            >
              {item.question}
              <IconChevronDown
                className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-accent-400" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-ink-secondary">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
