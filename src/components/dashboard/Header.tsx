import { ProjectSelect } from "./ProjectSelect";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/10 bg-surface/80 px-4 backdrop-blur">
      <ProjectSelect />

      <div className="flex items-center gap-3">
        <span className="h-8 w-8 rounded-full bg-accent-500/20 text-center text-sm leading-8 text-accent-400">
          U
        </span>
      </div>
    </header>
  );
}
