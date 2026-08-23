"use client";

import { useEffect, useState } from "react";

type LogLine = {
  time: string;
  tag: "INFO" | "WARN" | "ERROR" | "FIXED";
  message: string;
};

// Séquence de logs rejouée en boucle pour illustrer la surveillance en direct.
// Le dernier événement montre Argos AI qui traduit une erreur brute en langage clair.
const SEQUENCE: LogLine[] = [
  { time: "03:14:02", tag: "INFO", message: "api-production — déploiement terminé" },
  { time: "03:14:07", tag: "INFO", message: "Healthcheck OK — tous les services répondent" },
  { time: "03:15:41", tag: "WARN", message: "Temps de réponse en hausse sur /checkout" },
  { time: "03:15:42", tag: "ERROR", message: "connect ECONNREFUSED 127.0.0.1:5432" },
  { time: "03:15:42", tag: "FIXED", message: "Argos AI : « La base de données a refusé la connexion — probablement à cause d'un redémarrage. »" },
  { time: "03:15:43", tag: "INFO", message: "SMS envoyé à l'équipe infra" },
];

const TAG_STYLES: Record<LogLine["tag"], string> = {
  INFO: "text-ink-muted",
  WARN: "text-amber-400",
  ERROR: "text-rose-400",
  FIXED: "text-accent-400",
};

export function LiveLogTerminal() {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((count) => (count >= SEQUENCE.length ? 1 : count + 1));
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const lines = SEQUENCE.slice(0, visibleCount);

  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised/80 shadow-2xl shadow-accent-500/5 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-surface-border/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        <span className="ml-2 font-mono text-xs text-ink-muted">argos — api-production</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-accent-400">
          <span className="animate-pulse-ring h-1.5 w-1.5 rounded-full bg-accent-400" />
          en direct
        </span>
      </div>

      <div className="flex h-64 flex-col justify-end space-y-2 overflow-hidden px-4 py-4 font-mono text-xs sm:text-sm">
        {lines.map((line, i) => (
          <div key={`${visibleCount}-${i}`} className="animate-line-in flex gap-3">
            <span className="shrink-0 text-ink-muted">{line.time}</span>
            <span className={`shrink-0 font-semibold ${TAG_STYLES[line.tag]}`}>
              {line.tag.padEnd(5, " ")}
            </span>
            <span className="text-ink-secondary">{line.message}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-ink-muted">
          <span>$</span>
          <span className="inline-block h-3.5 w-1.5 animate-caret bg-accent-400" />
        </div>
      </div>
    </div>
  );
}
