"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { mockProjects } from "@/lib/mock-data";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { TextInput } from "@/components/dashboard/FormField";
import { IconPlus } from "@/components/icons/NavIcons";

type NotifiedPerson = {
  id: string;
  name: string;
  contact: string;
};

export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id);

  const [notified, setNotified] = useState<NotifiedPerson[]>([
    { id: "p1", name: "Marine Sola", contact: "marinesola348@gmail.com" },
  ]);
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");

  if (!project) {
    notFound();
  }

  // Pas de backend branché pour l'instant : ces soumissions ne persistent rien réellement.
  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContact.trim()) return;
    setNotified((prev) => [...prev, { id: crypto.randomUUID(), name: newName, contact: newContact }]);
    setNewName("");
    setNewContact("");
  };

  const handleRemovePerson = (id: string) => {
    setNotified((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDelete = () => {
    // Aucune suppression réelle pour l'instant, confirmation à brancher avec le backend.
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Paramètres du projet</h1>
        <p className="mt-1 text-sm text-ink-secondary">Configuration de {project.name}.</p>
      </div>

      <SettingsSection title="Informations générales" description="Nom du projet et branche GitHub surveillée.">
        <form onSubmit={handleGeneralSubmit} className="space-y-4">
          <TextInput label="Nom du projet" id="project-name" defaultValue={project.name} />
          <TextInput label="Dépôt GitHub" id="project-repo" defaultValue={project.githubRepo} disabled />
          <TextInput label="Branche surveillée" id="project-branch" defaultValue={project.githubBranch} />
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Enregistrer
          </button>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Personnes à notifier"
        description="Ces personnes reçoivent un SMS ou un email lorsqu'une alerte est détectée sur ce projet."
      >
        <ul className="mb-4 space-y-2">
          {notified.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between rounded-lg border border-surface-border/10 bg-surface px-3 py-2"
            >
              <div>
                <p className="text-sm text-ink-primary">{person.name}</p>
                <p className="text-xs text-ink-muted">{person.contact}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePerson(person.id)}
                className="text-xs text-status-critical hover:underline"
              >
                Retirer
              </button>
            </li>
          ))}
          {notified.length === 0 && (
            <p className="text-sm text-ink-secondary">Personne n'est notifié pour ce projet actuellement.</p>
          )}
        </ul>

        <form onSubmit={handleAddPerson} className="flex items-end gap-3">
          <div className="flex-1">
            <TextInput
              label="Nom"
              id="new-person-name"
              placeholder="Jean Dupont"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <TextInput
              label="Email ou téléphone"
              id="new-person-contact"
              placeholder="jean@exemple.com"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            <IconPlus className="h-4 w-4" />
            Ajouter
          </button>
        </form>
      </SettingsSection>

      <section className="rounded-xl border border-status-critical/30 bg-status-critical/5 p-5">
        <h2 className="text-sm font-medium text-status-critical">Zone de danger</h2>
        <p className="mt-1 text-xs text-ink-secondary">
          Supprimer ce projet arrêtera la collecte de logs et supprimera son historique. Cette action est irréversible.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          className="mt-4 rounded-lg border border-status-critical/40 px-4 py-2 text-sm font-medium text-status-critical transition hover:bg-status-critical/10"
        >
          Supprimer le projet
        </button>
      </section>
    </div>
  );
}
