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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <StateCard
      action={
        onAction
          ? { label: actionLabel ?? (isKorean ? "다시 시도" : "Try again"), onAction }
          : undefined
      }
      body={body}
      label={label ?? (isKorean ? "오류" : "Error")}
      size="section"
      title={title}
      tone="error"
    />
  );
}
