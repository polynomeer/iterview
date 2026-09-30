import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey, type MessageParams } from "../../shared/i18n";
import { Badge, Button, ButtonLink, Card, EmptyState, ErrorState, ListRow, PageHeader, PageSkeleton, type Tone } from "../../shared/ui/primitives";
import { interviewTypeLabelKey } from "./interviewTypes";
import "./practical.css";

type RecordItem = NonNullable<ReturnType<typeof useInterviewRecordListQuery>["data"]>[number];

function recordStatus(record: RecordItem, t: (key: MessageKey, params?: MessageParams) => string): { label: string; tone: Tone } {
  switch (record.transcriptStatus) {
    case "pending":
    case "processing":
      return { label: t("practicalRecords.transcribing"), tone: "accent" };
    case "failed":
      return { label: t("practicalRecords.transcriptionFailed"), tone: "danger" };
    default:
      return record.questionCount > 0
        ? { label: t("practicalRecords.questionCount", { questionCount: record.questionCount }), tone: "success" }
        : { label: t("practicalRecords.checkQuestions"), tone: "warning" };
  }
}

/** 실전 면접 복기: interviews you brought in, newest first. */
export function PracticalInterviewListPage() {
  const { t } = useLocale();
  const recordsQuery = useInterviewRecordListQuery();
  const records = recordsQuery.data ?? [];
  const addLink = (
    <ButtonLink icon="plus" to={routeConfig.practicalInterviewUpload.buildPath()} variant="primary">
      {t("practicalRecords.addAnInterview")}
    </ButtonLink>
  );

  if (recordsQuery.isLoading) {
    return <PageSkeleton label={t("practicalRecords.loadingInterviews")} />;
  }

  if (recordsQuery.isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void recordsQuery.refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(recordsQuery.error, t("practicalRecords.yourInterviewsCouldNotBe"))}
        details={getErrorDetails(recordsQuery.error)}
        size="page"
        title={t("practicalRecords.unableToLoadInterviews")}
      />
    );
  }

  return (
    <div className="ui-page">
      <PageHeader
        actions={records.length > 0 ? addLink : undefined}
        description={t("practicalRecords.bringInARealInterview")}
        title={t("practicalRecords.realInterviewReview")}
      />
      {records.length === 0 ? (
        <EmptyState
          actions={addLink}
          body={t("practicalRecords.uploadARecordingOrRecord")}
          icon="interview"
          title={t("practicalRecords.noInterviewsYet")}
        />
      ) : (
        <Card aria-label={t("practicalRecords.interviews")}>
          {records.map((record) => {
            const status = recordStatus(record, t);
            const typeKey = interviewTypeLabelKey(record.interviewType);
            return (
              <ListRow
                key={record.id}
                meta={
                  <span className="practical-row-meta">
                    {[record.interviewDateLabel ?? record.createdAtLabel, typeKey ? t(typeKey) : null].filter(Boolean).join(" · ")}
                    {record.transcriptStatus === "failed" && record.transcriptErrorLabel ? ` · ${record.transcriptErrorLabel}` : ""}
                  </span>
                }
                title={record.title}
                trailing={
                  <span className="practical-row-actions">
                    <Badge dot tone={status.tone}>
                      {status.label}
                    </Badge>
                    <ButtonLink size="sm" to={routeConfig.practicalInterviewDetail.buildPath({ recordId: record.id })} variant="ghost">
                      {t("practicalRecords.open")}
                    </ButtonLink>
                  </span>
                }
              />
            );
          })}
        </Card>
      )}
    </div>
  );
}
