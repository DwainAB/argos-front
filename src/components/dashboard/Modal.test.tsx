import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("n'affiche rien quand open est false", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Titre">
        Contenu
      </Modal>
    );

    expect(screen.queryByText("Titre")).not.toBeInTheDocument();
    expect(screen.queryByText("Contenu")).not.toBeInTheDocument();
  });

  it("affiche le titre et le contenu quand open est true (après montage)", async () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Mon titre">
        Mon contenu
      </Modal>
    );

    await waitFor(() => expect(screen.getByText("Mon titre")).toBeInTheDocument());
    expect(screen.getByText("Mon contenu")).toBeInTheDocument();
  });

  it("appelle onClose au clic sur l'overlay", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Titre">
        Contenu
      </Modal>
    );

    await waitFor(() => expect(screen.getByLabelText("Fermer la fenêtre")).toBeInTheDocument());
    await userEvent.click(screen.getByLabelText("Fermer la fenêtre"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose au clic sur le bouton de fermeture", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Titre">
        Contenu
      </Modal>
    );

    await waitFor(() => expect(screen.getByLabelText("Fermer")).toBeInTheDocument());
    await userEvent.click(screen.getByLabelText("Fermer"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose quand la touche Échap est pressée", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Titre">
        Contenu
      </Modal>
    );

    await waitFor(() => expect(screen.getByText("Titre")).toBeInTheDocument());
    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas onClose pour une autre touche", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Titre">
        Contenu
      </Modal>
    );

    await waitFor(() => expect(screen.getByText("Titre")).toBeInTheDocument());
    await userEvent.keyboard("{Enter}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("est rendu dans document.body via un portail", async () => {
    const { container } = render(
      <Modal open={true} onClose={vi.fn()} title="Titre">
        Contenu
      </Modal>
    );

    await waitFor(() => expect(screen.getByText("Titre")).toBeInTheDocument());
    // Le contenu n'est pas un descendant direct du container de rendu (il est porté dans body).
    expect(container).toBeEmptyDOMElement();
  });
});
