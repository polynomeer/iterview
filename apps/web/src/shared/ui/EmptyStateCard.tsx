import { useLocale } from "../i18n";
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
  label,
  title,
  body,
  action,
}: EmptyStateCardProps) {
  const { t } = useLocale();

  return <StateCard action={action} body={body} label={label ?? t("common.emptyState")} title={title} tone="empty" />;
}
