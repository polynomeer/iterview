import { useLocale } from "../i18n";
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
  label,
  title,
  body,
  details,
  actionLabel,
  onAction,
}: ErrorStateCardProps) {
  const { t } = useLocale();

  return (
    <StateCard
      action={onAction ? { label: actionLabel ?? t("common.tryAgain"), onAction } : undefined}
      body={body}
      details={details}
      label={label ?? t("common.errorState")}
      title={title}
      tone="error"
    />
  );
}
