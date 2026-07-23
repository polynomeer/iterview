type MetricCardProps = {
  label: string;
  value: string;
  helperText?: string;
  tone?: "default" | "accent" | "muted";
};

export function MetricCard({
  label,
  value,
  helperText,
  tone = "default",
}: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="metric-card__label">{label}</p>
      <strong className="metric-card__value">{value}</strong>
      {helperText ? <p className="metric-card__helper">{helperText}</p> : null}
    </article>
  );
}
