import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

type BadgeProps = {
  tone?: Tone;
  /** Adds a leading dot. Status color is always paired with the text label. */
  dot?: boolean;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone = "neutral", dot = false, className, children }: BadgeProps) {
  return (
    <span className={cx("ui-badge", `ui-badge--${tone}`, className)}>
      {dot ? <span aria-hidden="true" className="ui-badge__dot" /> : null}
      {children}
    </span>
  );
}

type CardProps = ComponentProps<"section"> & { padded?: boolean };

/** One level of containment: cards hold text, lists, and dividers, never other cards. */
export function Card({ padded = false, className, ...rest }: CardProps) {
  return <section className={cx("ui-card", padded && "ui-card--padded", className)} {...rest} />;
}

type CardHeaderProps = {
  title: ReactNode;
  titleAs?: "h2" | "h3" | "h4";
  meta?: ReactNode;
  actions?: ReactNode;
};

export function CardHeader({ title, titleAs: Title = "h3", meta, actions }: CardHeaderProps) {
  return (
    <header className="ui-card__header">
      <Title className="ui-card__title">{title}</Title>
      {meta}
      {actions ? <div className="ui-card__actions">{actions}</div> : null}
    </header>
  );
}

export function CardBody({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cx("ui-card__body", className)} {...rest} />;
}

type ListRowProps = {
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function ListRow({ leading, title, meta, trailing, className }: ListRowProps) {
  return (
    <div className={cx("ui-list-row", className)}>
      {leading ? <div className="ui-list-row__leading">{leading}</div> : null}
      <div className="ui-list-row__main">
        <div className="ui-list-row__title">{title}</div>
        {meta ? <div className="ui-list-row__meta">{meta}</div> : null}
      </div>
      {trailing ? <div className="ui-list-row__trailing">{trailing}</div> : null}
    </div>
  );
}

type StatProps = {
  label: ReactNode;
  value: ReactNode;
  /** Change since the previous period, e.g. "+7". Positive values render as success. */
  delta?: { label: ReactNode; direction: "up" | "down" };
  tone?: Tone;
};

export function Stat({ label, value, delta, tone = "neutral" }: StatProps) {
  return (
    <div className="ui-stat">
      <span className="ui-stat__label">{label}</span>
      <span className={cx("ui-stat__value", `ui-tone-text--${tone}`)}>{value}</span>
      {delta ? (
        <span className={cx("ui-stat__delta", delta.direction === "up" ? "ui-tone-text--success" : "ui-tone-text--danger")}>
          {delta.label}
        </span>
      ) : null}
    </div>
  );
}

type ProgressProps = {
  /** 0–100. */
  value: number;
  label: string;
  tone?: Tone;
};

export function Progress({ value, label, tone = "accent" }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={clamped} className="ui-progress" role="progressbar">
      <span className={cx("ui-progress__bar", `ui-progress__bar--${tone}`)} style={{ width: `${clamped}%` }} />
    </div>
  );
}

type CalloutProps = {
  tone?: Exclude<Tone, "neutral">;
  icon?: IconName;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

const CALLOUT_ICONS: Record<Exclude<Tone, "neutral">, IconName> = {
  accent: "info",
  success: "check",
  warning: "alert",
  danger: "alert",
};

export function Callout({ tone = "accent", icon, title, children, className }: CalloutProps) {
  return (
    <div className={cx("ui-callout", `ui-callout--${tone}`, className)} role={tone === "danger" ? "alert" : undefined}>
      <Icon className="ui-callout__icon" name={icon ?? CALLOUT_ICONS[tone]} size={16} />
      <div className="ui-callout__body">
        {title ? <strong className="ui-callout__title">{title}</strong> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}

type SkeletonProps = {
  width?: string;
  height?: string;
  className?: string;
};

export function Skeleton({ width = "100%", height = "1rem", className }: SkeletonProps) {
  return <span aria-hidden="true" className={cx("ui-skeleton", className)} style={{ width, height }} />;
}

type PageSkeletonProps = {
  /** Announced to screen readers while the skeleton is visible. */
  label: string;
};

/** Layout-stable placeholder for a page that is still loading its code or data. */
export function PageSkeleton({ label }: PageSkeletonProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="ui-page-skeleton" role="status">
      <span className="ui-visually-hidden">{label}</span>
      <Skeleton height="0.75rem" width="18%" />
      <Skeleton height="1.75rem" width="46%" />
      <Skeleton height="0.875rem" width="64%" />
      <div className="ui-page-skeleton__grid">
        <Skeleton height="10rem" />
        <Skeleton height="10rem" />
      </div>
    </div>
  );
}
