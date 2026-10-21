import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBanner } from "./StatusBanner";
import { statusLabels, statusSummaries, type ProjectStatus } from "@/lib/mock-data";

describe("StatusBanner", () => {
  (["good", "warning", "critical"] as ProjectStatus[]).forEach((status) => {
    it(`affiche le libellé et le résumé pour le statut '${status}'`, () => {
      render(<StatusBanner status={status} />);

      expect(screen.getByText(statusLabels[status])).toBeInTheDocument();
      expect(screen.getByText(statusSummaries[status])).toBeInTheDocument();
    });
  });
});
