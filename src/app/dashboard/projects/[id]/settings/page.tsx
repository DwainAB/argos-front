import { Suspense } from "react";
import { ProjectSettingsContent } from "./ProjectSettingsContent";

export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <ProjectSettingsContent projectId={params.id} />
    </Suspense>
  );
}
