import { useParams } from "react-router-dom";
import type { ResultAnalysisModel } from "../../entities/result/model";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { scoreTone, withSubjectParticle } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  Icon,
  ListRow,
  PageHeader,
  PageSkeleton,
  Progress,
} from "../../shared/ui/primitives";
import "./result.css";

const TONE_WORD: Record<ReturnType<typeof scoreTone>, MessageKey> = {
  danger: "resultAnalysis.toneWeak",
  warning: "resultAnalysis.toneNeedsWork",
  success: "resultAnalysis.toneStrong",
  neutral: "resultAnalysis.tonePending",
};

/** Previous attempt's total for the same question, taken from the answer history. */
function usePreviousScore(result: ResultAnalysisModel) {
  const historyQuery = useQuestionAnswerHistoryQuery(result.questionId || undefined);
  const items = historyQuery.data?.items ?? [];
  const currentIndex = items.findIndex((item) => item.answerAttemptId === result.answerAttemptId);
  const previous = currentIndex >= 0 ? items.slice(currentIndex + 1).find((item) => item.totalScore !== null) : undefined;
  return previous?.totalScore ?? null;
}

function ScoreHero({ result }: { result: ResultAnalysisModel }) {
  const { t } = useLocale();
  const previous = usePreviousScore(result);
  const total = result.totalScoreValue;
  const tone = scoreTone(total);
  const toneWord = t(TONE_WORD[tone]);
  const delta = total !== null && previous !== null ? total - previous : null;
  const scored = result.dimensions.filter((dimension) => dimension.score !== null);
  const weakest = scored.reduce<(typeof scored)[number] | null>(
    (low, dimension) => (!low || (dimension.score ?? 0) < (low.score ?? 0) ? dimension : low),
    null,
  );
  const nextFollowUp = result.followUpRecommendations[0] ?? null;

  return (
    <Card aria-label={t("resultAnalysis.scoreSummary")} className="result-hero">
      <div className="result-hero__total">
        <span className="result-label">{t("resultAnalysis.total")}</span>
        <span className={`result-hero__score ui-tone-text--${tone}`}>{total ?? "-"}</span>
        {delta !== null ? (
          <span className={`result-hero__delta ui-tone-text--${delta >= 0 ? "success" : "danger"}`}>
            {delta >= 0 ? "▲" : "▼"} {t("resultAnalysis.scoreDelta", { delta: Math.abs(delta), previous: previous ?? "" })}
          </span>
        ) : null}
        <Badge dot tone={tone}>
          {toneWord}
        </Badge>
        {result.evaluationResult && result.evaluationResult !== toneWord ? (
          <span className="result-hero__verdict">{result.evaluationResult}</span>
        ) : null}
      </div>

      <div className="result-hero__dimensions">
        <span className="result-label">{t("resultAnalysis.byDimension")}</span>
        {scored.length === 0 ? (
          <p className="result-muted">{t("resultAnalysis.noDimensionScores")}</p>
        ) : (
          scored.map((dimension) => (
            <div className="result-dimension" key={dimension.id}>
              <span>{dimension.label}</span>
              <Progress label={dimension.label} tone={scoreTone(dimension.score)} value={dimension.score ?? 0} />
              <strong className={`ui-tone-text--${scoreTone(dimension.score)}`}>{dimension.score}</strong>
            </div>
          ))
        )}
      </div>

      <div className="result-hero__next">
        <span className="result-label">{t("resultAnalysis.next")}</span>
        <p>
          {weakest ? (
            <>
              <strong>“{weakest.label}”</strong>
              {t("resultAnalysis.weakestSuffix", { particle: withSubjectParticle(weakest.label).slice(weakest.label.length) })}
            </>
          ) : null}
          {result.recommendedNextStep ?? t("resultAnalysis.defaultNextStep")}
        </p>
        <ButtonLink to={routeConfig.answerEditor.buildPath({ questionId: result.questionId })} variant="primary">
          {t("resultAnalysis.answerAgain")}
        </ButtonLink>
        {nextFollowUp ? (
          <ButtonLink to={routeConfig.questionDetail.buildPath({ questionId: nextFollowUp.id })}>{t("resultAnalysis.nextFollowUp")}</ButtonLink>
        ) : null}
        {result.nextReviewLabel ? (
          <span className="result-muted">
            {t("resultAnalysis.backInReview", { date: result.nextReviewLabel })}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

function FeedbackCard({ result }: { result: ResultAnalysisModel }) {
  const { t } = useLocale();
  const good = [...result.strengthPoints, ...(result.strengthSummary ? [result.strengthSummary] : [])];
  const improve = [...result.improvementPoints, ...result.missedPoints, ...(result.weaknessSummary ? [result.weaknessSummary] : [])];
  const extra = result.feedbackItems.filter((item) => item.description);

  if (good.length === 0 && improve.length === 0 && extra.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="result-feedback-title">
      <CardHeader title={<span id="result-feedback-title">{t("resultAnalysis.feedback")}</span>} />
      <CardBody>
        <ul className="result-feedback">
          {good.map((point) => (
            <li key={`good-${point}`}>
              <Icon className="ui-tone-text--success" name="check" size={16} />
              <span>
                <span className="ui-visually-hidden">{t("resultAnalysis.strengthPrefix")}</span>
                {point}
              </span>
            </li>
          ))}
          {improve.map((point) => (
            <li key={`improve-${point}`}>
              <Icon className="ui-tone-text--warning" name="alert" size={16} />
              <span>
                <span className="ui-visually-hidden">{t("resultAnalysis.improvePrefix")}</span>
                {point}
              </span>
            </li>
          ))}
          {extra.map((item) => (
            <li key={item.id}>
              <Icon
                className={`ui-tone-text--${item.tone === "positive" ? "success" : item.tone === "improving" ? "warning" : "neutral"}`}
                name={item.tone === "positive" ? "check" : "info"}
                size={16}
              />
              <span>
                <strong>{item.title}</strong> {item.description}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

export function ResultAnalysisPage() {
  const { answerAttemptId } = useParams<{ answerAttemptId: string }>();
  const { t } = useLocale();
  const resultQuery = useResultAnalysisQuery(answerAttemptId);
  const result = resultQuery.data;

  if (resultQuery.isLoading) {
    return <PageSkeleton label={t("resultAnalysis.loading")} />;
  }

  if (resultQuery.isError || !result) {
    if (!resultQuery.isError || (resultQuery.error instanceof ApiClientError && resultQuery.error.status === 404)) {
      return (
        <ErrorState
          actions={
            <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
              {t("common.backToPractice")}
            </ButtonLink>
          }
          body={t("resultAnalysis.notFoundBody")}
          icon="search"
          size="page"
          title={t("resultAnalysis.notFoundTitle")}
        />
      );
    }

    return (
      <ErrorState
        actions={
          <Button onClick={() => void resultQuery.refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(resultQuery.error, t("resultAnalysis.loadErrorBody"))}
        details={getErrorDetails(resultQuery.error)}
        size="page"
        title={t("resultAnalysis.loadErrorTitle")}
      />
    );
  }

  return (
    <div className="ui-page result-page">
      <PageHeader
        description={result.questionTitle}
        title={
          result.attemptNumber
            ? t("resultAnalysis.titleWithAttempt", { count: result.attemptNumber })
            : t("resultAnalysis.title")
        }
      />
      <ScoreHero result={result} />
      <div className="result-layout">
        <div className="result-layout__main">
          <Card aria-labelledby="result-answer-title">
            <CardHeader
              actions={
                <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: result.questionId })} variant="ghost">
                  {t("resultAnalysis.viewQuestion")}
                </ButtonLink>
              }
              title={<span id="result-answer-title">{t("resultAnalysis.yourAnswer")}</span>}
            />
            <CardBody>
              {result.answerText ? (
                <p className="result-answer">{result.answerText}</p>
              ) : (
                <p className="result-muted">{t("resultAnalysis.answerUnavailable")}</p>
              )}
            </CardBody>
          </Card>
          {result.modelAnswer ? (
            <details className="result-reference-answer">
              <summary>{t("resultAnalysis.compareModelAnswer")}</summary>
              <p className="result-answer">{result.modelAnswer.text}</p>
            </details>
          ) : null}
        </div>
        <aside aria-label={t("resultAnalysis.asideLabel")} className="result-layout__aside">
          <FeedbackCard result={result} />
          {result.followUpRecommendations.length > 0 ? (
            <Card aria-labelledby="result-followups-title">
              <CardHeader title={<span id="result-followups-title">{t("resultAnalysis.likelyFollowUps")}</span>} />
              {result.followUpRecommendations.slice(0, 4).map((item) => (
                <ListRow
                  key={item.id}
                  title={item.title}
                  trailing={
                    <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: item.id })} variant="ghost">
                      {t("resultAnalysis.open")}
                    </ButtonLink>
                  }
                />
              ))}
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
