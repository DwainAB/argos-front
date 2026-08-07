import { Suspense } from "react";
import { NewProjectContent } from "./NewProjectContent";

// useSearchParams (utilisé dans NewProjectContent pour lire le retour du flux OAuth Railway)
// nécessite un Suspense boundary pour l'export statique de Next.js.
export default function NewProjectPage() {
  return (
    <Suspense fallback={null}>
      <NewProjectContent />
    </Suspense>
  );
}
