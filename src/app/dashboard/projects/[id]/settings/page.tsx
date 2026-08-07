import { Suspense } from "react";
import { ProjectSettingsContent } from "./ProjectSettingsContent";

// useSearchParams (utilisé pour lire le retour du flux d'installation GitHub) nécessite
// un Suspense boundary pour l'export statique de Next.js.
export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <ProjectSettingsContent projectId={params.id} />
    </Suspense>
  );
}
