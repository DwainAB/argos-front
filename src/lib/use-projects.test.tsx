import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("./api-fetch", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "./api-fetch";
import { projectOwnerLabel, useProjects, type ApiProject } from "./use-projects";

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

beforeEach(() => {
  vi.mocked(apiFetch).mockReset();
});

describe("projectOwnerLabel", () => {
  it("renvoie 'Personnel' pour un compte personnel", () => {
    expect(projectOwnerLabel(makeProject({ user: { accountType: "personal", organizationName: null } }))).toBe(
      "Personnel",
    );
  });

  it("renvoie le nom de l'organisation pour un compte organisation", () => {
    expect(
      projectOwnerLabel(makeProject({ user: { accountType: "organization", organizationName: "Ma Société" } })),
    ).toBe("Ma Société");
  });

  it("retombe sur 'Organisation' si le nom n'est pas renseigné", () => {
    expect(
      projectOwnerLabel(makeProject({ user: { accountType: "organization", organizationName: null } })),
    ).toBe("Organisation");
  });
});

describe("useProjects", () => {
  it("charge les projets au montage et passe loading à false", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ json: async () => ({ projects: [makeProject()] }) } as Response);

    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.projects).toHaveLength(1);
  });

  it("recharge les projets via refetch", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ json: async () => ({ projects: [] }) } as Response);

    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(apiFetch).mockResolvedValue({ json: async () => ({ projects: [makeProject()] }) } as Response);
    await result.current.refetch();

    await waitFor(() => expect(result.current.projects).toHaveLength(1));
  });
});
