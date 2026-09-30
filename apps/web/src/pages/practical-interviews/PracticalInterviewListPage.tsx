import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Badge, Button, ButtonLink, Card, EmptyState, ErrorState, ListRow, PageHeader, PageSkeleton, type Tone } from "../../shared/ui/primitives";
import { interviewTypeLabel } from "./interviewTypes";
import "./practical.css";

type RecordItem = NonNullable<ReturnType<typeof useInterviewRecordListQuery>["data"]>[number];

function recordStatus(record: RecordItem, copy: (ko: string, en: string) => string): { label: string; tone: Tone } {
  switch (record.transcriptStatus) {
    case "pending":
    case "processing":
      return { label: copy("대본 만드는 중", "Transcribing"), tone: "accent" };
    case "failed":
      return { label: copy("대본 만들기 실패", "Transcription failed"), tone: "danger" };
    default:
      return record.questionCount > 0
        ? { label: copy(`질문 ${record.questionCount}개`, `${record.questionCount} questions`), tone: "success" }
        : { label: copy("질문 확인 필요", "Check questions"), tone: "warning" };
  }
}

/** 실전 면접 복기: interviews you brought in, newest first. */
export function PracticalInterviewListPage() {
  const { t, locale } = useLocale();
  const copy = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const recordsQuery = useInterviewRecordListQuery();
  const records = recordsQuery.data ?? [];
  const addLink = (
    <ButtonLink icon="plus" to={routeConfig.practicalInterviewUpload.buildPath()} variant="primary">
      {copy("면접 기록 추가", "Add an interview")}
    </ButtonLink>
  );

  if (recordsQuery.isLoading) {
    return <PageSkeleton label={copy("면접 기록을 불러오는 중", "Loading interviews")} />;
  }

  if (recordsQuery.isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void recordsQuery.refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(recordsQuery.error, copy("면접 기록을 불러오지 못했어요.", "Your interviews could not be loaded."))}
        details={getErrorDetails(recordsQuery.error)}
        size="page"
        title={copy("면접 기록을 불러올 수 없어요", "Unable to load interviews")}
      />
    );
  }

  return (
    <div className="ui-page">
      <PageHeader
        actions={records.length > 0 ? addLink : undefined}
        description={copy("다녀온 면접을 올리면 받은 질문을 뽑아 복습하고, 같은 흐름으로 다시 연습할 수 있어요.", "Bring in a real interview to review the questions you got and practice the same flow again.")}
        title={copy("실전 면접 복기", "Real interview review")}
      />
      {records.length === 0 ? (
        <EmptyState
          actions={addLink}
          body={copy("녹음 파일을 올리거나 이 화면에서 바로 녹음할 수 있어요.", "Upload a recording or record right here.")}
          icon="interview"
          title={copy("아직 올린 면접이 없어요", "No interviews yet")}
        />
      ) : (
        <Card aria-label={copy("면접 기록", "Interviews")}>
          {records.map((record) => {
            const status = recordStatus(record, copy);
            return (
              <ListRow
                key={record.id}
                meta={
                  <span className="practical-row-meta">
                    {[record.interviewDateLabel ?? record.createdAtLabel, interviewTypeLabel(record.interviewType, locale === "ko")].filter(Boolean).join(" · ")}
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
                      {copy("열기", "Open")}
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
