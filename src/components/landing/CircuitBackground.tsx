// Décor de fond façon circuit imprimé : lignes fines qui se croisent avec un point
// aux intersections, répété en pattern SVG. Purement décoratif, très faible opacité.
export function CircuitBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full text-surface-border"
      aria-hidden="true"
      preserveAspectRatio="xMidYMin slice"
    >
      <defs>
        <pattern id="circuit-grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <path
            d="M0 60H120M60 0V120"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
            fill="none"
          />
          <circle cx="60" cy="60" r="2" fill="currentColor" fillOpacity="0.16" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit-grid)" />
    </svg>
  );
}
