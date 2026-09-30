import { StateCard } from "./StateCard";
import { useLocale } from "../i18n";

type SectionErrorStateProps = {
  label?: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionErrorState({
  label,
  title,
  body,
  actionLabel,
  onAction,
}: SectionErrorStateProps) {
  const { t } = useLocale();

  return (
    <StateCard
      action={
        onAction
          ? { label: actionLabel ?? t("common.tryAgain"), onAction }
          : undefined
      }
      body={body}
      label={label ?? t("common.errorState")}
      size="section"
      title={title}
      tone="error"
    />
  );
}
