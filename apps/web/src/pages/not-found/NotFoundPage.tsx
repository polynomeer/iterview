import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { ButtonLink, EmptyState } from "../../shared/ui/primitives";

export function NotFoundPage() {
  const { t } = useLocale();

  return (
    <EmptyState
      actions={
        <ButtonLink to={routeConfig.home.buildPath()} variant="primary">
          {t("common.goToToday")}
        </ButtonLink>
      }
      body={t("common.pageNotFoundBody")}
      icon="search"
      size="page"
      title={t("common.pageNotFoundTitle")}
    />
  );
}
