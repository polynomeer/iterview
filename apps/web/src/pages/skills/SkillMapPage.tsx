import { useMemo, useState } from "react";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { useSkillProgressQuery } from "../../features/skills/api/useSkillProgressQuery";
import { useSkillRadarQuery } from "../../features/skills/api/useSkillRadarQuery";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { scoreTone, skillCategoryLabel } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  PageSkeleton,
  Progress,
  Segmented,
  Stat,
} from "../../shared/ui/primitives";
import "./skills.css";

export type SkillRow = {
  key: string;
  code: string | null;
  label: string;
  score: number | null;
  benchmark: number | null;
  answered: number;
  weak: number;
};

/** Progress carries counts; radar fills in categories progress has not scored yet. */
export function mergeSkillRows(
  progress: ReturnType<typeof useSkillProgressQuery>["data"],
  radar: ReturnType<typeof useSkillRadarQuery>["data"],
  labelFor: (code: string | null, fallback: string) => string,
): SkillRow[] {
  const rows = new Map<string, SkillRow>();

  radar?.categories.forEach((category) => {
    rows.set(category.id, {
      key: category.id,
      code: category.code,
      label: labelFor(category.code, category.label),
      score: category.score,
      benchmark: category.benchmarkScore,
      answered: 0,
      weak: 0,
    });
  });
  progress?.items.forEach((item) => {
    const existing = rows.get(item.id);
    rows.set(item.id, {
      key: item.id,
      code: item.code,
      label: labelFor(item.code, item.label),
      score: item.score ?? existing?.score ?? null,
      benchmark: item.benchmarkScore ?? existing?.benchmark ?? null,
      answered: item.answeredQuestionCount,
      weak: item.weakQuestionCount,
    });
  });

  return [...rows.values()];
}

/** A zero score with no answers means "not measured yet", not "weakest". */
export const isUnmeasured = (row: SkillRow) => row.score === null || (row.score === 0 && row.answered === 0);
const gapOf = (row: SkillRow) => (isUnmeasured(row) ? Number.POSITIVE_INFINITY : (row.score ?? 0) - (row.benchmark ?? row.score ?? 0));

export function SkillMapPage() {
  const { locale, t } = useLocale();
  const progressQuery = useSkillProgressQuery();
  const radarQuery = useSkillRadarQuery();
  const questionsQuery = usePracticeQuestionsQuery({});
  const [order, setOrder] = useState<"weakest" | "name">("weakest");
  const rows = useMemo(() => {
    const merged = mergeSkillRows(progressQuery.data, radarQuery.data, (code, fallback) => skillCategoryLabel(code, locale) ?? fallback);
    return merged.sort((left, right) => (order === "weakest" ? gapOf(left) - gapOf(right) : left.label.localeCompare(right.label, locale)));
  }, [locale, order, progressQuery.data, radarQuery.data]);
  // Question categories share names with skill categories (e.g. "System Design"), which lets a
  // skill link to its questions without a dedicated API.
  const categoryIdByName = useMemo(
    () => new Map((questionsQuery.data?.filters.categories ?? []).map((option) => [option.label.toLowerCase(), option.id])),
    [questionsQuery.data],
  );

  const isLoading = progressQuery.isLoading && radarQuery.isLoading;
  const unsupported = (query: { error: unknown }) => query.error instanceof ApiClientError && query.error.status === 404;
  const failed = progressQuery.isError && radarQuery.isError && !(unsupported(progressQuery) && unsupported(radarQuery));

  if (isLoading) {
    return <PageSkeleton label={t("skillMap.loading")} />;
  }

  if (failed) {
    return (
      <ErrorState
        actions={
          <Button
            onClick={() => {
              void progressQuery.refetch();
              void radarQuery.refetch();
            }}
            variant="primary"
          >
            {t("skillMap.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(progressQuery.error, t("skillMap.loadErrorBody"))}
        details={getErrorDetails(progressQuery.error)}
        size="page"
        title={t("skillMap.loadErrorTitle")}
      />
    );
  }

  const answered = rows.reduce((sum, row) => sum + row.answered, 0);
  const weak = rows.reduce((sum, row) => sum + row.weak, 0);
  const weakest = [...rows].filter((row) => !isUnmeasured(row)).sort((left, right) => gapOf(left) - gapOf(right))[0] ?? null;

  return (
    <div className="ui-page skill-page">
      <PageHeader
        description={t("skillMap.description")}
        title={t("skillMap.title")}
      />

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            actions={
              <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
                {t("skillMap.goToQuestions")}
              </ButtonLink>
            }
            body={t("skillMap.emptyBody")}
            icon="skills"
            title={t("skillMap.emptyTitle")}
          />
        </Card>
      ) : (
        <>
          <Card aria-label={t("skillMap.summaryLabel")} className="skill-summary" padded>
            <Stat label={t("skillMap.areasTracked")} value={rows.length} />
            <Stat label={t("skillMap.questionsAnswered")} value={answered} />
            <Stat label={t("skillMap.weakAnswers")} tone={weak > 0 ? "danger" : "neutral"} value={weak} />
            <Stat label={t("skillMap.weakestArea")} tone="warning" value={weakest?.label ?? "-"} />
          </Card>

          <Card aria-labelledby="skill-list-title">
            <CardHeader
              actions={
                <Segmented
                  items={[
                    { id: "weakest", label: t("skillMap.sortWeakest") },
                    { id: "name", label: t("skillMap.sortName") },
                  ]}
                  label={t("skillMap.sort")}
                  onChange={setOrder}
                  value={order}
                />
              }
              title={<span id="skill-list-title">{t("skillMap.listTitle")}</span>}
            />
            <ul className="skill-list">
              {rows.map((row) => {
                const unmeasured = isUnmeasured(row);
                const tone = unmeasured ? "neutral" : scoreTone(row.score);
                const gap = !unmeasured && row.benchmark !== null && row.score !== null ? row.score - row.benchmark : null;
                const categoryId = categoryIdByName.get(row.label.toLowerCase()) ?? (row.code ? categoryIdByName.get(row.code.replace(/_/g, " ").toLowerCase()) : undefined);
                return (
                  <li className="skill-list__row" key={row.key}>
                    <div className="skill-list__head">
                      <strong>{row.label}</strong>
                      <span className={`skill-list__score ui-tone-text--${tone}`}>
                        {unmeasured ? t("skillMap.notMeasured") : Math.round(row.score ?? 0)}
                      </span>
                    </div>
                    <div className="skill-list__bar">
                      <Progress label={t("skillMap.rowReadiness", { skill: row.label })} tone={tone} value={row.score ?? 0} />
                      {row.benchmark !== null ? (
                        <span aria-hidden="true" className="skill-list__target" style={{ left: `${Math.min(100, Math.max(0, row.benchmark))}%` }} />
                      ) : null}
                    </div>
                    <div className="skill-list__meta">
                      {row.benchmark !== null ? <span>{t("skillMap.target", { score: row.benchmark })}</span> : null}
                      {gap !== null ? (
                        <Badge tone={gap >= 0 ? "success" : "warning"}>
                          {gap >= 0 ? t("skillMap.onTarget") : t("skillMap.toTarget", { gap: Math.abs(Math.round(gap)) })}
                        </Badge>
                      ) : null}
                      <span>{t("skillMap.rowCounts", { answered: row.answered, weak: row.weak })}</span>
                      {categoryId ? (
                        <ButtonLink size="sm" to={`${routeConfig.practice.buildPath()}?category=${categoryId}`} variant="ghost">
                          {t("skillMap.relatedQuestions")}
                        </ButtonLink>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
