"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

const GREETING = "Bonjour, je suis Argos. Je suis là pour veiller sur vos serveurs !";
const PROMPT = "Une question vous trotte dans la tête ? N'hésitez surtout pas !";

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Qui es-tu ?",
    answer:
      "Moi c'est Argos ! Je passe mes journées et mes nuits à veiller sur tes serveurs, un peu comme un petit gardien silencieux. :D",
  },
  {
    question: "Comment tu m'aides concrètement ?",
    answer:
      "Je lis tous tes logs à ta place, et dès que je vois un souci, je t'explique ce qui se passe avec des mots simples, promis, pas de jargon compliqué.",
  },
  {
    question: "Et si un truc casse pendant la nuit ?",
    answer:
      "Je te réveille gentiment avec un SMS ou un email pour te prévenir. Toi tu dors, moi je surveille — c'est notre deal.",
  },
  {
    question: "Tu dors jamais ?",
    answer:
      "Nope, zéro seconde de sommeil. Entre nous, je crois que quelqu'un a oublié de m'installer un mode veille. :)",
  },
];

type Stage = "greeting" | "prompt" | "hidden" | "menu" | "answer";

let sharedAudioContext: AudioContext | null = null;

function playTypeBlip() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  if (!sharedAudioContext) sharedAudioContext = new AudioContextClass();
  const ctx = sharedAudioContext;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 520 + Math.random() * 80;

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.05);
}

function Typewriter({
  text,
  className,
  speedMs = 35,
  onTypingDone,
}: {
  text: string;
  className?: string;
  speedMs?: number;
  onTypingDone?: () => void;
}) {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    setVisibleChars(0);
  }, [text]);

  useEffect(() => {
    if (visibleChars >= text.length) {
      if (visibleChars === text.length) onTypingDone?.();
      return;
    }
    const timeout = setTimeout(() => {
      if (text[visibleChars] !== " ") playTypeBlip();
      setVisibleChars((count) => count + 1);
    }, speedMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleChars, text, speedMs]);

  const isDone = visibleChars >= text.length;

  return (
    <span className={className}>
      {text.slice(0, visibleChars)}
      <span
        className={`ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-ink-primary ${isDone ? "animate-caret" : ""}`}
        aria-hidden="true"
      />
    </span>
  );
}

function ContinueArrow({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="animate-pop-in absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center text-white transition hover:opacity-70"
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" aria-hidden="true">
        <path d="M6 3l5 5-5 5" />
      </svg>
    </button>
  );
}

const TYPEWRITER_SPEED_MS = 30;

export function ArgosMascot() {
  const [stage, setStage] = useState<Stage>("greeting");
  const [visibleQuestions, setVisibleQuestions] = useState(0);
  const [answeredQuestion, setAnsweredQuestion] = useState<number | null>(null);
  const [robotVisible, setRobotVisible] = useState(true);
  const [textFullyTyped, setTextFullyTyped] = useState(false);

  useEffect(() => {
    if (stage !== "menu") return;
    if (visibleQuestions >= FAQ.length) return;
    const timeout = setTimeout(() => setVisibleQuestions((count) => count + 1), 150);
    return () => clearTimeout(timeout);
  }, [stage, visibleQuestions]);

  function openMenu() {
    setAnsweredQuestion(null);
    setVisibleQuestions(0);
    setRobotVisible(true);
    setStage("menu");
  }

  function selectQuestion(index: number) {
    setAnsweredQuestion(index);
    setStage("answer");
  }

  function closeMenu() {
    setStage("hidden");
  }

  function goToPrompt() {
    setTextFullyTyped(false);
    setStage("prompt");
  }

  return (
    <div className="pointer-events-none fixed bottom-0 right-6 z-30 hidden items-end gap-3 lg:flex">
      <div className="pointer-events-auto relative mb-2">
        {stage !== "hidden" && (
          <div
            className={`${pixelFont.className} relative max-w-[220px] rounded-lg border-4 border-ink-primary bg-surface-raised p-3 text-[9px] leading-relaxed text-ink-primary shadow-[4px_4px_0_0_rgb(var(--ink-primary))]`}
          >
            {(stage === "menu" || stage === "answer") && (
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Fermer"
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink-primary bg-surface text-[10px] leading-none text-ink-primary transition hover:bg-accent-500 hover:text-surface"
              >
                ×
              </button>
            )}

            {stage === "greeting" && (
              <>
                <Typewriter
                  text={GREETING}
                  speedMs={TYPEWRITER_SPEED_MS}
                  onTypingDone={() => setTextFullyTyped(true)}
                />
                {textFullyTyped && (
                  <ContinueArrow onClick={goToPrompt} label="Continuer" />
                )}
              </>
            )}

            {stage === "prompt" && (
              <>
                <Typewriter
                  text={PROMPT}
                  speedMs={TYPEWRITER_SPEED_MS}
                  onTypingDone={() => setTextFullyTyped(true)}
                />
                {textFullyTyped && (
                  <ContinueArrow onClick={closeMenu} label="Fermer" />
                )}
              </>
            )}

            {stage === "menu" && (
              <div className="space-y-2">
                <p className="mb-2">Que voulez-vous savoir ?</p>
                {FAQ.slice(0, visibleQuestions).map((item, index) => (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => selectQuestion(index)}
                    className="animate-pop-in block w-full rounded border-2 border-ink-primary bg-surface px-2 py-1.5 text-left leading-snug transition hover:bg-accent-500 hover:text-surface"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            )}

            {stage === "answer" && answeredQuestion !== null && (
              <div className="space-y-2">
                <Typewriter text={FAQ[answeredQuestion].answer} speedMs={TYPEWRITER_SPEED_MS} />
                <button
                  type="button"
                  onClick={openMenu}
                  className="mt-2 block w-full rounded border-2 border-ink-primary bg-surface px-2 py-1.5 text-left leading-snug transition hover:bg-accent-500 hover:text-surface"
                >
                  ← Revenir aux questions
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-[220px] overflow-hidden">
        <div
          className={`flex flex-col items-center transition-transform duration-500 ease-in ${
            robotVisible ? "translate-y-0" : "translate-y-[170px]"
          }`}
        >
          <div className="pointer-events-auto z-10 mb-3 flex h-9 items-center gap-2">
            {stage === "hidden" && (
              <button
                type="button"
                onClick={openMenu}
                aria-label="Poser une question à Argos"
                className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-ink-primary bg-accent-500 text-sm font-bold text-surface shadow-[3px_3px_0_0_rgb(var(--ink-primary))] transition hover:bg-accent-400"
              >
                <span className={pixelFont.className}>?</span>
              </button>
            )}

            {stage === "hidden" && (
              <button
                type="button"
                onClick={() => setRobotVisible((visible) => !visible)}
                aria-label={robotVisible ? "Cacher Argos" : "Afficher Argos"}
                className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-ink-primary bg-surface-raised text-ink-primary shadow-[3px_3px_0_0_rgb(var(--ink-primary))] transition hover:bg-accent-500 hover:text-surface"
              >
                <svg
                  viewBox="0 0 16 16"
                  className={`h-4 w-4 transition-transform ${robotVisible ? "" : "rotate-180"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  <path d="M3 6l5 5 5-5" />
                </svg>
              </button>
            )}
          </div>

          <div className={robotVisible ? "animate-float" : ""}>
            <Image
              src="/robot-avatar.png"
              alt="Argos, la mascotte robot d'Argos AI"
              width={120}
              height={120}
              className="pointer-events-auto drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
