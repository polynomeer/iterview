import { StateCard } from "./StateCard";

type ErrorStateCardProps = {
  label?: string;
  title: string;
  body: string;
  details?: string[];
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorStateCard({
  label = "Error",
  title,
  body,
  details,
  actionLabel = "Try again",
  onAction,
}: ErrorStateCardProps) {
  return (
    <StateCard
      action={onAction ? { label: actionLabel, onAction } : undefined}
      body={body}
      details={details}
      label={label}
      title={title}
      tone="error"
    />
  );
}
