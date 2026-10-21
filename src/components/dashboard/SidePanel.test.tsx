import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidePanel } from "./SidePanel";

describe("SidePanel", () => {
  it("n'affiche rien quand open est false", () => {
    render(
      <SidePanel open={false} onClose={vi.fn()} title="Titre">
        Contenu
      </SidePanel>
    );

    expect(screen.queryByText("Titre")).not.toBeInTheDocument();
  });

  it("affiche le titre et le contenu quand open est true", async () => {
    render(
      <SidePanel open={true} onClose={vi.fn()} title="Mon panneau">
        Mon contenu
      </SidePanel>
    );

    await waitFor(() => expect(screen.getByText("Mon panneau")).toBeInTheDocument());
    expect(screen.getByText("Mon contenu")).toBeInTheDocument();
  });

  it("appelle onClose au clic sur l'overlay", async () => {
    const onClose = vi.fn();
    render(
      <SidePanel open={true} onClose={onClose} title="Titre">
        Contenu
      </SidePanel>
    );

    await waitFor(() => expect(screen.getByLabelText("Fermer le panneau")).toBeInTheDocument());
    await userEvent.click(screen.getByLabelText("Fermer le panneau"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose au clic sur le bouton de fermeture", async () => {
    const onClose = vi.fn();
    render(
      <SidePanel open={true} onClose={onClose} title="Titre">
        Contenu
      </SidePanel>
    );

    await waitFor(() => expect(screen.getByLabelText("Fermer")).toBeInTheDocument());
    await userEvent.click(screen.getByLabelText("Fermer"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose quand la touche Échap est pressée", async () => {
    const onClose = vi.fn();
    render(
      <SidePanel open={true} onClose={onClose} title="Titre">
        Contenu
      </SidePanel>
    );

    await waitFor(() => expect(screen.getByText("Titre")).toBeInTheDocument());
    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
