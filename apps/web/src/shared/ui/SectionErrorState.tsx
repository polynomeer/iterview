import { StateCard } from "./StateCard";

type SectionErrorStateProps = {
  label?: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionErrorState({
  label = "Error",
  title,
  body,
  actionLabel = "Try again",
  onAction,
}: SectionErrorStateProps) {
  return (
    <StateCard
      action={onAction ? { label: actionLabel, onAction } : undefined}
      body={body}
      label={label}
      size="section"
      title={title}
      tone="error"
    />
  );
}
