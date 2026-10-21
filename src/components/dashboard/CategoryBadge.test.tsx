import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryBadge, categoryLabels } from "./CategoryBadge";

describe("CategoryBadge", () => {
  it("affiche le libellé correspondant pour chaque catégorie connue", () => {
    (["critical", "warning", "benign", "info"] as const).forEach((category) => {
      const { unmount } = render(<CategoryBadge category={category} />);
      expect(screen.getByText(categoryLabels[category])).toBeInTheDocument();
      unmount();
    });
  });

  it("retombe sur 'Info' pour une catégorie inconnue", () => {
    render(<CategoryBadge category="catégorie-inconnue" />);

    expect(screen.getByText(categoryLabels.info)).toBeInTheDocument();
  });
});
