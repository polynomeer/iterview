type QuestionStatusBadgeProps = {
  status?: string | null;
};

function getStatusTone(status?: string | null) {
  switch (status) {
    case "strong":
    case "archived":
      return "positive";
    case "weak":
    case "retry":
      return "warning";
    case "improving":
      return "accent";
    default:
      return "neutral";
  }
}

function formatStatusLabel(status?: string | null) {
  if (!status) {
    return "New";
  }

  return status
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function QuestionStatusBadge({ status }: QuestionStatusBadgeProps) {
  return (
    <span className={`question-status-badge question-status-badge--${getStatusTone(status)}`}>
      {formatStatusLabel(status)}
    </span>
  );
}
