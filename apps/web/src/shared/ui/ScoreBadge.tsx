type ScoreBadgeProps = {
  value: string;
  label?: string;
  tone?: "default" | "positive" | "warning" | "neutral";
};

export function ScoreBadge({
  value,
  label,
  tone = "default",
}: ScoreBadgeProps) {
  return (
    <span className={`score-badge score-badge--${tone}`}>
      {label ? <span className="score-badge__label">{label}</span> : null}
      <strong className="score-badge__value">{value}</strong>
    </span>
  );
}
