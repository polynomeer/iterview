import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";
import { Button, ButtonLink, EmptyState, ErrorState, PageSkeleton } from "../../../../shared/ui/primitives";

export function MissingRecordView() {
  const { t } = useLocale();

  return (
    <EmptyState
      actions={
        <ButtonLink to={routeConfig.practicalInterviews.buildPath()} variant="primary">
          {t("recordReview.backToRecords")}
        </ButtonLink>
      }
      body={t("recordReview.missingBody")}
      icon="search"
      size="page"
      title={t("recordReview.missingTitle")}
    />
  );
}

export function ReviewLoadingView() {
  const { t } = useLocale();
  return <PageSkeleton label={t("recordReview.loading")} />;
}

export function ReviewLoadErrorView({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useLocale();

  return (
    <ErrorState
      actions={
        <Button onClick={onRetry} variant="primary">
          {t("common.tryAgain")}
        </Button>
      }
      body={userFacingErrorMessage(error, t("recordReview.loadErrorBody"))}
      details={getErrorDetails(error)}
      size="page"
      title={t("recordReview.loadErrorTitle")}
    />
  );
}
