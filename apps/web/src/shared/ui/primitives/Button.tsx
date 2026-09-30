import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  fullWidth?: boolean;
};

function buttonClassName({ variant = "secondary", size = "md", fullWidth }: ButtonStyleProps, className?: string) {
  return ["ui-button", `ui-button--${variant}`, `ui-button--${size}`, fullWidth ? "ui-button--full" : null, className]
    .filter(Boolean)
    .join(" ");
}

function ButtonContent({ icon, loading, children }: { icon?: IconName; loading?: boolean; children: ReactNode }) {
  return (
    <>
      {loading ? <span aria-hidden="true" className="ui-button__spinner" /> : icon ? <Icon name={icon} size={16} /> : null}
      <span>{children}</span>
    </>
  );
}

type ButtonProps = ComponentProps<"button"> & ButtonStyleProps & { loading?: boolean };

export function Button({ variant, size, icon, fullWidth, loading = false, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      aria-busy={loading || undefined}
      className={buttonClassName({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      type={type}
      {...rest}
    >
      <ButtonContent icon={icon} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

/** A navigation that looks like a button. Use for actions that change the route. */
export function ButtonLink({ variant, size, icon, fullWidth, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClassName({ variant, size, fullWidth }, className)} {...rest}>
      <ButtonContent icon={icon}>{children}</ButtonContent>
    </Link>
  );
}

type IconButtonProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  icon: IconName;
  /** Required: icon-only controls must have an accessible name. */
  label: string;
  variant?: Exclude<ButtonVariant, "primary">;
  size?: ButtonSize;
};

export function IconButton({ icon, label, variant = "ghost", size = "md", className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={["ui-icon-button", `ui-button--${variant}`, `ui-icon-button--${size}`, className].filter(Boolean).join(" ")}
      title={label}
      type={type}
      {...rest}
    >
      <Icon name={icon} size={size === "lg" ? 20 : 18} />
    </button>
  );
}
