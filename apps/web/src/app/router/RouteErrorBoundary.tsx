import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { NotFoundPage } from "../../pages/not-found/NotFoundPage";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Button, ButtonLink, ErrorState } from "../../shared/ui/primitives";

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
    <ErrorState
      actions={
        <>
          <Button onClick={() => window.location.reload()} variant="primary">
            {t("common.reloadPage")}
          </Button>
          <ButtonLink to={routeConfig.home.buildPath()}>{t("common.goToToday")}</ButtonLink>
        </>
      }
      body={t("common.unexpectedErrorBody")}
      size="page"
      title={t("common.unexpectedErrorTitle")}
    />
  );
}
