export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-primary">{title}</h1>
      <p className="mt-1 text-sm text-ink-secondary">À construire prochainement.</p>
    </div>
  );
}
