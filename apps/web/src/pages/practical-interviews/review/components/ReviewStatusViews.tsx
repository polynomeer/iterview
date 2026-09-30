import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";
import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../../../shared/ui/PageContainer";

export function MissingRecordView() {
  const { t } = useLocale();

  return (
    <PageContainer
      description={
        t("practicalReview.chooseImportedInterviewRecord")
      }
      eyebrow={t("practicalReview.practicalInterviewEyebrow")}
      title={t("practicalReview.reviewUnavailable")}
    >
      <EmptyStateCard
        action={{ label: t("practicalReview.openPracticalInterviews"), to: routeConfig.practicalInterviews.buildPath() }}
        body={t("practicalReview.missingRecordBody")}
        title={t("practicalReview.missingInterviewRecord")}
      />
    </PageContainer>
  );
}

export function ReviewLoadingView() {
  const { t } = useLocale();

  return (
    <PageContainer
      description={
        t("practicalReview.loadingReviewShellTranscript")
      }
      eyebrow={t("practicalReview.practicalInterviewEyebrow")}
      title={t("practicalReview.preparingReviewWorkspace")}
    >
      <LoadingStateCard
        body={
          t("practicalReview.loadingBackendReviewPayload")
        }
        title={t("practicalReview.preparingPracticalInterviewReview")}
      />
    </PageContainer>
  );
}

export function ReviewLoadErrorView({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useLocale();

  return (
    <PageContainer
      description={t("practicalReview.loadErrorBody")}
      eyebrow={t("practicalReview.practicalInterviewEyebrow")}
      title={t("practicalReview.reviewUnavailable")}
    >
      <ErrorStateCard
        body={userFacingErrorMessage(error, t("practicalReview.loadErrorBody"))}
        details={getErrorDetails(error)}
        onAction={onRetry}
        title={t("practicalReview.unableLoadPracticalInterview")}
      />
    </PageContainer>
  );
}
