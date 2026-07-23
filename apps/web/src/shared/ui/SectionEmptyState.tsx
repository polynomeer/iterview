import { StateCard } from "./StateCard";

type SectionEmptyStateProps = {
  label?: string;
  title: string;
  body: string;
  action?: {
    label: string;
    to: string;
    variant?: "primary" | "secondary";
  };
};

export function SectionEmptyState({
  label = "Empty",
  title,
  body,
  action,
}: SectionEmptyStateProps) {
  return <StateCard action={action} body={body} label={label} size="section" title={title} tone="empty" />;
}
