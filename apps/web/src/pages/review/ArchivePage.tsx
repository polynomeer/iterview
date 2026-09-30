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

type SourceFilter = "all" | "practice" | "interview" | "real_interview";

export function ArchivePage() {
  const { locale, t } = useLocale();
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
    return <PageSkeleton label={t("reviewQueue.archiveLoading")} />;
  }

  if (archiveQuery.isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void archiveQuery.refetch()} variant="primary">
            {t("reviewQueue.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(archiveQuery.error, t("reviewQueue.archiveLoadErrorBody"))}
        details={getErrorDetails(archiveQuery.error)}
        size="page"
        title={t("reviewQueue.archiveLoadErrorTitle")}
      />
    );
  }

  const total = archiveQuery.data?.items.length ?? 0;

  return (
    <div className="ui-page review-page">
      <PageHeader
        description={t("reviewQueue.archiveDescription")}
        title={t("reviewQueue.archiveTitle")}
      />

      {recordId ? (
        <Callout>
          {t("reviewQueue.archiveRecordFilter")}{" "}
          <button className="review-inline-link" onClick={() => setSearchParams(new URLSearchParams(), { replace: true })} type="button">
            {t("reviewQueue.showAll")}
          </button>
        </Callout>
      ) : null}

      <Card aria-labelledby="archive-list-title">
        <CardHeader
          actions={
            <Segmented
              items={[
                { id: "all", label: t("reviewQueue.sourceAll") },
                { id: "practice", label: t("reviewQueue.sourcePractice") },
                { id: "interview", label: t("reviewQueue.sourceInterview") },
                { id: "real_interview", label: t("reviewQueue.sourceRealInterview") },
              ]}
              label={t("reviewQueue.source")}
              onChange={setSource}
              value={source}
            />
          }
          meta={<Badge>{total}</Badge>}
          title={<span id="archive-list-title">{t("reviewQueue.archiveListTitle")}</span>}
        />
        <div className="review-archive__search">
          <Field label={t("reviewQueue.searchTitles")}>
            {(control) => <Input {...control} onChange={(event) => setSearch(event.target.value)} type="search" value={search} />}
          </Field>
        </div>
        {items.length === 0 ? (
          <EmptyState
            body={
              total === 0
                ? t("reviewQueue.archiveEmptyBody")
                : t("reviewQueue.archiveNoMatchBody")
            }
            icon="archive"
            title={total === 0 ? t("reviewQueue.archiveEmptyTitle") : t("reviewQueue.archiveNoMatchTitle")}
          />
        ) : (
          items.map((item) => (
            <ListRow
              key={item.id}
              meta={[
                item.sourceBadgeLabel,
                difficultyLabel(item.difficulty, locale),
                t("reviewQueue.attemptCount", { count: item.totalAttemptCount }),
                item.archivedAtLabel,
              ]
                .filter(Boolean)
                .join(" · ")}
              title={item.questionTitle}
              trailing={
                <>
                  {item.bestScore !== null ? (
                    <Badge tone={scoreTone(item.bestScore)}>{t("reviewQueue.bestScore", { score: item.bestScore })}</Badge>
                  ) : null}
                  {item.sourceSessionId ? (
                    <ButtonLink size="sm" to={routeConfig.interviewSessionResult.buildPath({ sessionId: item.sourceSessionId })} variant="ghost">
                      {t("reviewQueue.session")}
                    </ButtonLink>
                  ) : null}
                  <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: item.questionId })}>
                    {t("reviewQueue.review")}
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
