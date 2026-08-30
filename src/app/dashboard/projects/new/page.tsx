import { Suspense } from "react";
import { NewProjectContent } from "./NewProjectContent";

export default function NewProjectPage() {
  return (
    <Suspense fallback={null}>
      <NewProjectContent />
    </Suspense>
  );
}
