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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <StateCard
      action={action}
      body={body}
      label={label ?? (isKorean ? "비어 있음" : "Empty")}
      size="section"
      title={title}
      tone="empty"
    />
  );
}
