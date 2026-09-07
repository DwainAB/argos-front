type SignupFieldsProps = {
  firstName: string;
  onFirstNameChange: (value: string) => void;
  lastName: string;
  onLastNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
};

const inputClassName =
  "w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500";

export function SignupFields({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
}: SignupFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm text-ink-secondary">
            Prénom
          </label>
          <input
            id="firstName"
            type="text"
            required
            placeholder="Jane"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm text-ink-secondary">
            Nom
          </label>
          <input
            id="lastName"
            type="text"
            required
            placeholder="Dupont"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-ink-secondary">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="vous@exemple.com"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-ink-secondary">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={inputClassName}
        />
        <p className="mt-1.5 text-xs text-ink-muted">8 caractères minimum.</p>
      </div>
    </>
  );
}
