import { StateCard } from "./StateCard";

type EmptyStateCardProps = {
  label?: string;
  title: string;
  body: string;
  action?: {
    label: string;
    to: string;
  };
};

export function EmptyStateCard({
  label = "Empty",
  title,
  body,
  action,
}: EmptyStateCardProps) {
  return <StateCard action={action} body={body} label={label} title={title} tone="empty" />;
}
