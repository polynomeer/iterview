import { useLocale } from "../i18n";
import { StateCard } from "./StateCard";

type SectionLoadingStateProps = {
  label?: string;
  title: string;
  body: string;
};

export function SectionLoadingState({
  label,
  title,
  body,
}: SectionLoadingStateProps) {
  const { t } = useLocale();

  return <StateCard body={body} label={label ?? t("common.loadingState")} size="section" title={title} tone="loading" />;
}
