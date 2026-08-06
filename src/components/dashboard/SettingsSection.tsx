import type { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="rounded-xl border border-surface-border/10 bg-surface-raised p-5">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-ink-primary">{title}</h2>
        {description && <p className="mt-1 text-xs text-ink-secondary">{description}</p>}
      </div>
      {children}
    </section>
  );
}
