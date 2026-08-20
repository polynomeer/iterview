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
      <div className="metric-card__header">
        <p className="metric-card__label">{label}</p>
      </div>
      <strong className="metric-card__value">{value}</strong>
      {helperText ? <p className="metric-card__helper">{helperText}</p> : null}
    </article>
  );
}
