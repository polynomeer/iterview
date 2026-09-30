import { StateCard } from "./StateCard";
import { useLocale } from "../i18n";

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
  label,
  title,
  body,
  action,
}: SectionEmptyStateProps) {
  const { t } = useLocale();

  return (
    <StateCard
      action={action}
      body={body}
      label={label ?? t("common.emptyState")}
      size="section"
      title={title}
      tone="empty"
    />
  );
}
