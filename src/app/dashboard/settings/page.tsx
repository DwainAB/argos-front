"use client";

import { useState } from "react";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { TextInput, SelectField } from "@/components/dashboard/FormField";

export default function AccountSettingsPage() {
  const [language, setLanguage] = useState("fr");
  const [phone, setPhone] = useState("");

  // Pas de backend branché pour l'instant : ces soumissions ne persistent rien.
  const handleLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Paramètres du compte</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Gérez vos préférences personnelles et vos informations de connexion.
        </p>
      </div>

      <SettingsSection title="Thème" description="Choisissez l'apparence de l'interface.">
        <ThemeToggle />
      </SettingsSection>

      <SettingsSection title="Langue" description="Langue utilisée dans l'interface.">
        <form onSubmit={handleLanguageSubmit} className="flex items-end gap-3">
          <div className="w-48">
            <SelectField
              label="Langue"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </SelectField>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Enregistrer
          </button>
        </form>
      </SettingsSection>

      <SettingsSection title="Mot de passe" description="Modifiez le mot de passe de votre compte.">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <TextInput label="Mot de passe actuel" id="current-password" type="password" placeholder="••••••••" />
          <TextInput label="Nouveau mot de passe" id="new-password" type="password" placeholder="••••••••" />
          <TextInput
            label="Confirmer le nouveau mot de passe"
            id="confirm-password"
            type="password"
            placeholder="••••••••"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Mettre à jour le mot de passe
          </button>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Numéro de téléphone"
        description="Utilisé pour l'envoi des notifications par SMS."
      >
        <form onSubmit={handlePhoneSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <TextInput
              label="Numéro de téléphone"
              id="phone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
          >
            Enregistrer
          </button>
        </form>
      </SettingsSection>
    </div>
  );
}
