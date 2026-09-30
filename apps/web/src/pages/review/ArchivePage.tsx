import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useArchiveQuery } from "../../features/archive/api/useArchiveQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { difficultyLabel, scoreTone } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  Input,
  ListRow,
  PageHeader,
  PageSkeleton,
  Segmented,
} from "../../shared/ui/primitives";
import "./review.css";

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

type SourceFilter = "all" | "practice" | "interview" | "real_interview";

export function ArchivePage() {
  const { locale } = useLocale();
  const copy = useCopy();
  const [searchParams, setSearchParams] = useSearchParams();
  const recordId = searchParams.get("sourceInterviewRecordId");
  const recordQuestionId = searchParams.get("sourceInterviewQuestionId");
  const archiveQuery = useArchiveQuery({});
  const [source, setSource] = useState<SourceFilter>("all");
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return (archiveQuery.data?.items ?? []).filter((item) => {
      if (recordId && item.sourceInterviewRecordId !== recordId) return false;
      if (recordQuestionId && item.sourceInterviewQuestionId !== recordQuestionId) return false;
      if (source !== "all" && item.sourceType !== source) return false;
      return !normalized || item.questionTitle.toLowerCase().includes(normalized);
    });
  }, [archiveQuery.data, recordId, recordQuestionId, search, source]);

  if (archiveQuery.isLoading) {
    return <PageSkeleton label={copy("완료한 질문을 불러오는 중", "Loading finished questions")} />;
  }

  if (archiveQuery.isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void archiveQuery.refetch()} variant="primary">
            {copy("다시 시도", "Try again")}
          </Button>
        }
        body={userFacingErrorMessage(archiveQuery.error, copy("완료한 질문을 불러오지 못했어요.", "We couldn't load finished questions."))}
        details={getErrorDetails(archiveQuery.error)}
        size="page"
        title={copy("완료한 질문을 열 수 없어요", "Finished questions are unavailable")}
      />
    );
  }

  const total = archiveQuery.data?.items.length ?? 0;

  return (
    <div className="ui-page review-page">
      <PageHeader
        description={copy("충분히 방어한 질문이에요. 면접 전에 다시 훑어보세요.", "Questions you've mastered. Skim them again before the interview.")}
        title={copy("완료한 질문", "Finished questions")}
      />

      {recordId ? (
        <Callout>
          {copy("실전 면접 기록에서 온 질문만 보고 있어요.", "Showing only questions from one real interview record.")}{" "}
          <button className="review-inline-link" onClick={() => setSearchParams(new URLSearchParams(), { replace: true })} type="button">
            {copy("전체 보기", "Show all")}
          </button>
        </Callout>
      ) : null}

      <Card aria-labelledby="archive-list-title">
        <CardHeader
          actions={
            <Segmented
              items={[
                { id: "all", label: copy("전체", "All") },
                { id: "practice", label: copy("연습", "Practice") },
                { id: "interview", label: copy("모의면접", "Mock") },
                { id: "real_interview", label: copy("실전", "Real") },
              ]}
              label={copy("출처", "Source")}
              onChange={setSource}
              value={source}
            />
          }
          meta={<Badge>{total}</Badge>}
          title={<span id="archive-list-title">{copy("완료 목록", "Finished")}</span>}
        />
        <div className="review-archive__search">
          <Field label={copy("제목 검색", "Search titles")}>
            {(control) => <Input {...control} onChange={(event) => setSearch(event.target.value)} type="search" value={search} />}
          </Field>
        </div>
        {items.length === 0 ? (
          <EmptyState
            body={
              total === 0
                ? copy("질문을 충분히 잘 답하면 여기에 모여요.", "Questions you answer well collect here.")
                : copy("조건을 바꿔 보세요.", "Try different filters.")
            }
            icon="archive"
            title={total === 0 ? copy("아직 완료한 질문이 없어요", "Nothing finished yet") : copy("조건에 맞는 질문이 없어요", "No matches")}
          />
        ) : (
          items.map((item) => (
            <ListRow
              key={item.id}
              meta={[
                item.sourceBadgeLabel,
                difficultyLabel(item.difficulty, locale),
                copy(`시도 ${item.totalAttemptCount}회`, `${item.totalAttemptCount} attempts`),
                item.archivedAtLabel,
              ]
                .filter(Boolean)
                .join(" · ")}
              title={item.questionTitle}
              trailing={
                <>
                  {item.bestScore !== null ? (
                    <Badge tone={scoreTone(item.bestScore)}>{copy(`최고 ${item.bestScore}점`, `Best ${item.bestScore}`)}</Badge>
                  ) : null}
                  {item.sourceSessionId ? (
                    <ButtonLink size="sm" to={routeConfig.interviewSessionResult.buildPath({ sessionId: item.sourceSessionId })} variant="ghost">
                      {copy("면접 결과", "Session")}
                    </ButtonLink>
                  ) : null}
                  <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: item.questionId })}>
                    {copy("다시 보기", "Review")}
                  </ButtonLink>
                </>
              }
            />
          ))
        )}
      </Card>
    </div>
  );
}
