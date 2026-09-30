import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { NotFoundPage } from "../../pages/not-found/NotFoundPage";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { StateCard } from "../../shared/ui/StateCard";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useLocale();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!isNotFound) {
      console.error(error);
    }
  }, [error, isNotFound]);

  if (isNotFound) {
    return <NotFoundPage />;
  }

  return (
    <StateCard
      action={{ label: t("common.reloadPage"), onAction: () => window.location.reload() }}
      body={t("common.unexpectedErrorBody")}
      label={t("common.errorState")}
      title={t("common.unexpectedErrorTitle")}
      tone="error"
      secondaryAction={{ label: t("common.goToToday"), to: routeConfig.home.buildPath() }}
    />
  );
}
