import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { StateCard } from "../../shared/ui/StateCard";

export function NotFoundPage() {
  const { t } = useLocale();

  return (
    <StateCard
      action={{ label: t("common.goToToday"), to: routeConfig.home.buildPath() }}
      body={t("common.pageNotFoundBody")}
      label={t("common.pageNotFoundLabel")}
      title={t("common.pageNotFoundTitle")}
      tone="empty"
    />
  );
}
