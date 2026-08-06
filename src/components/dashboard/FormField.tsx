import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

type FieldWrapperProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

function FieldWrapper({ label, htmlFor, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm text-ink-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export function TextInput({ label, id, className, ...props }: TextInputProps) {
  return (
    <FieldWrapper label={label} htmlFor={id}>
      <input
        id={id}
        className={`w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 ${className ?? ""}`}
        {...props}
      />
    </FieldWrapper>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  id: string;
};

export function SelectField({ label, id, className, children, ...props }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id}>
      <select
        id={id}
        className={`w-full rounded-lg border border-surface-border/10 bg-surface px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 ${className ?? ""}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
