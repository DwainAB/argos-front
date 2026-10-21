import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectOwnerBadge } from "./ProjectOwnerBadge";
import type { ApiProject } from "@/lib/use-projects";

function makeProject(overrides: Partial<ApiProject> = {}): ApiProject {
  return {
    id: "proj-1",
    name: "Mon projet",
    githubRepo: null,
    githubBranch: null,
    gitlabRepo: null,
    gitlabBranch: null,
    railwayServiceId: null,
    railwayEnvironmentId: null,
    renderOwnerId: null,
    renderResourceId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: null,
    user: { accountType: "personal", organizationName: null },
    ...overrides,
  };
}

describe("ProjectOwnerBadge", () => {
  it("affiche 'Personnel' pour un projet personnel", () => {
    render(<ProjectOwnerBadge project={makeProject()} />);
    expect(screen.getByText("Personnel")).toBeInTheDocument();
  });

  it("affiche le nom de l'organisation pour un projet d'organisation", () => {
    render(
      <ProjectOwnerBadge
        project={makeProject({ user: { accountType: "organization", organizationName: "Ma Société" } })}
      />
    );
    expect(screen.getByText("Ma Société")).toBeInTheDocument();
  });
});
