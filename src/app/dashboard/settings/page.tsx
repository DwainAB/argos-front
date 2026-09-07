"use client";

import { useState } from "react";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { TextInput, SelectField } from "@/components/dashboard/FormField";
import { useCurrentUser } from "@/components/dashboard/UserContext";
import { ApiAuthError, updatePhone } from "@/lib/auth";

export default function AccountSettingsPage() {
  const user = useCurrentUser();

  const [language, setLanguage] = useState("fr");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSaved, setPhoneSaved] = useState(false);

  const handleLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneSaving(true);
    setPhoneError(null);
    setPhoneSaved(false);

    try {
      await updatePhone(phone);
      setPhoneSaved(true);
    } catch (err) {
      setPhoneError(err instanceof ApiAuthError ? err.message : "Impossible d'enregistrer ce numéro.");
    } finally {
      setPhoneSaving(false);
    }
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
        description="Utilisé pour l'envoi des notifications par SMS. Format international requis, ex. +33612345678."
      >
        <form onSubmit={handlePhoneSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <TextInput
              label="Numéro de téléphone"
              id="phone"
              type="tel"
              placeholder="+33612345678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneSaved(false);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={phoneSaving}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {phoneSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
        {phoneError && <p className="mt-2 text-sm text-status-critical">{phoneError}</p>}
        {phoneSaved && !phoneError && <p className="mt-2 text-sm text-status-good">Numéro enregistré.</p>}
      </SettingsSection>
    </div>
  );
}
