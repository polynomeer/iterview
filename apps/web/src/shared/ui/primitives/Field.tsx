import { useId, type ComponentProps, type ReactNode } from "react";

type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Appears next to the label, e.g. a "forgot password" link. */
  labelAction?: ReactNode;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

/** Label, hint, and error wiring for one form control. */
export function Field({ label, hint, error, labelAction, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["ui-field", className].filter(Boolean).join(" ")}>
      <div className="ui-field__label-row">
        <label className="ui-field__label" htmlFor={id}>
          {label}
        </label>
        {labelAction}
      </div>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint ? (
        <p className="ui-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ui-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={["ui-input", className].filter(Boolean).join(" ")} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={["ui-input", "ui-textarea", className].filter(Boolean).join(" ")} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <select className={["ui-input", "ui-select", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </select>
  );
}
