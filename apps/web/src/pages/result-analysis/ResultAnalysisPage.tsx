import { useId, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import type { ResultAnalysisModel, ResultDimensionModel } from "../../entities/result/model";
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
  type IconName,
  ListRow,
  PageSkeleton,
} from "../../shared/ui/primitives";
import "./result.css";

const TONE_WORD: Record<ReturnType<typeof scoreTone>, MessageKey> = {
  danger: "resultAnalysis.toneWeak",
  warning: "resultAnalysis.toneNeedsWork",
  success: "resultAnalysis.toneStrong",
  neutral: "resultAnalysis.tonePending",
};

/** The current attempt's submission time and the previous attempt's total, from the answer history. */
function useAttemptHistory(result: ResultAnalysisModel) {
  const historyQuery = useQuestionAnswerHistoryQuery(result.questionId || undefined);
  const items = historyQuery.data?.items ?? [];
  const currentIndex = items.findIndex((item) => item.answerAttemptId === result.answerAttemptId);
  const previous = currentIndex >= 0 ? items.slice(currentIndex + 1).find((item) => item.totalScore !== null) : undefined;
  return {
    previousScore: previous?.totalScore ?? null,
    submittedAtLabel: currentIndex >= 0 ? items[currentIndex].submittedAtLabel : null,
  };
}

function weakestDimension(dimensions: ResultDimensionModel[]) {
  return dimensions.reduce<ResultDimensionModel | null>(
    (low, dimension) => (!low || (dimension.score ?? 0) < (low.score ?? 0) ? dimension : low),
    null,
  );
}

function DimensionBar({ dimension, weakest }: { dimension: ResultDimensionModel; weakest: boolean }) {
  const value = Math.min(100, Math.max(0, dimension.score ?? 0));
  return (
    <div className={`result-dimension${weakest ? " result-dimension--weakest" : ""}`}>
      <span className="result-dimension__label">{dimension.label}</span>
      <div
        aria-label={dimension.label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className="result-dimension__track"
        role="progressbar"
      >
        <span className="result-dimension__fill" style={{ width: `${value}%` }} />
      </div>
      <span className="result-dimension__score">{dimension.score}</span>
    </div>
  );
}

function ScoreCard({ result, previousScore }: { result: ResultAnalysisModel; previousScore: number | null }) {
  const { t } = useLocale();
  const total = result.totalScoreValue;
  const tone = scoreTone(total);
  const toneWord = t(TONE_WORD[tone]);
  const delta = total !== null && previousScore !== null ? total - previousScore : null;
  const scored = result.dimensions.filter((dimension) => dimension.score !== null);
  const weakest = scored.length > 1 ? weakestDimension(scored) : null;

  return (
    <Card aria-label={t("resultAnalysis.scoreSummary")} className="result-score">
      <div className="result-score__total">
        <span className="result-label">{t("resultAnalysis.total")}</span>
        <span className="result-score__line">
          <span className={`result-score__value ui-tone-text--${tone}`}>{total ?? "-"}</span>
          {delta !== null ? (
            <span className={`result-score__delta ui-tone-text--${delta >= 0 ? "success" : "danger"}`}>
              {delta >= 0 ? "▲" : "▼"} {t("resultAnalysis.scoreDelta", { delta: Math.abs(delta), previous: previousScore ?? "" })}
            </span>
          ) : null}
        </span>
        <Badge dot tone={tone}>
          {toneWord}
        </Badge>
        {result.evaluationResult && result.evaluationResult !== toneWord ? (
          <span className="result-muted">{result.evaluationResult}</span>
        ) : null}
      </div>

      <div className="result-score__dimensions">
        <span className="result-label">{t("resultAnalysis.byDimension")}</span>
        {scored.length === 0 ? (
          <p className="result-muted">{t("resultAnalysis.noDimensionScores")}</p>
        ) : (
          scored.map((dimension) => (
            <DimensionBar dimension={dimension} key={dimension.id} weakest={dimension.id === weakest?.id} />
          ))
        )}
      </div>
    </Card>
  );
}

const MAX_STRENGTHS = 2;
const MAX_IMPROVEMENTS = 3;

function distinct(values: string[]) {
  return values.filter((value, index) => value.trim() && values.indexOf(value) === index);
}

/**
 * What the feedback card shows: a couple of strengths, the top improvements, and the missed
 * points on one line. The summaries and the rule-based feedback items repeat the analysis, so
 * they only stand in when the analysis has nothing for that group.
 */
export function feedbackGroups(result: ResultAnalysisModel) {
  const strengths = distinct(
    result.strengthPoints.length > 0 ? result.strengthPoints : result.strengthSummary ? [result.strengthSummary] : [],
  ).slice(0, MAX_STRENGTHS);
  const improvements = distinct(
    result.improvementPoints.length > 0 ? result.improvementPoints : result.weaknessSummary ? [result.weaknessSummary] : [],
  ).slice(0, MAX_IMPROVEMENTS);
  const missed = distinct(result.missedPoints);
  const items =
    strengths.length === 0 && improvements.length === 0 ? result.feedbackItems.filter((item) => item.description) : [];
  return { strengths, improvements, missed, items };
}

/** The one thing to fix next: the recommended step, else the top improvement. */
function mainTip(result: ResultAnalysisModel, improvements: string[]) {
  return result.recommendedNextStep?.trim() || improvements[0] || null;
}

function AnswerCard({ result }: { result: ResultAnalysisModel }) {
  const { t } = useLocale();
  const { improvements } = feedbackGroups(result);
  const tip = mainTip(result, improvements);
  const scored = result.dimensions.filter((dimension) => dimension.score !== null);
  const weakest = scored.length > 1 ? weakestDimension(scored) : null;

  return (
    <Card aria-labelledby="result-answer-title" className="result-answer-card">
      <CardHeader titleAs="h2" title={<span id="result-answer-title">{t("resultAnalysis.yourAnswer")}</span>} />
      <CardBody className="result-answer-card__body">
        {result.answerText ? (
          <p className="result-answer">{result.answerText}</p>
        ) : (
          <p className="result-muted">{t("resultAnalysis.answerUnavailable")}</p>
        )}
        {tip || weakest ? (
          <div className="result-tip">
            <span aria-hidden="true" className="result-tip__mark">
              !
            </span>
            <p>
              {weakest ? (
                <strong className="result-tip__lead">
                  <span>“{weakest.label}”</span>
                  {t("resultAnalysis.weakestSuffix", { particle: withSubjectParticle(weakest.label).slice(weakest.label.length) })}
                </strong>
              ) : null}
              {tip ?? t("resultAnalysis.defaultNextStep")}
            </p>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

function FeedbackCard({ result }: { result: ResultAnalysisModel }) {
  const { t } = useLocale();
  const groups = feedbackGroups(result);
  const tip = mainTip(result, groups.improvements);
  // The callout already shows the top improvement when there is no recommended step.
  const improvements = groups.improvements.filter((point) => point !== tip);
  const { strengths, missed, items } = groups;

  if (strengths.length === 0 && improvements.length === 0 && missed.length === 0 && items.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="result-feedback-title">
      <CardHeader titleAs="h2" title={<span id="result-feedback-title">{t("resultAnalysis.feedback")}</span>} />
      <CardBody className="result-feedback-groups">
        {strengths.length > 0 ? (
          <section aria-labelledby="result-strengths-title">
            <h3 className="result-feedback-heading" id="result-strengths-title">{t("resultAnalysis.strengthsHeading")}</h3>
            <ul className="result-feedback">
              {strengths.map((point) => (
                <li key={point}>
                  <Icon className="ui-tone-text--success" name="check" size={16} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {improvements.length > 0 ? (
          <section aria-labelledby="result-improve-title">
            <h3 className="result-feedback-heading" id="result-improve-title">{t("resultAnalysis.improveHeading")}</h3>
            <ul className="result-feedback">
              {improvements.map((point) => (
                <li key={point}>
                  <Icon className="ui-tone-text--warning" name="alert" size={16} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {missed.length > 0 ? (
          <p className="result-feedback-missed">
            <strong>{t("resultAnalysis.missedHeading")}</strong> {missed.join(" · ")}
          </p>
        ) : null}
        {items.length > 0 ? (
          <ul className="result-feedback">
            {items.map((item) => (
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
        ) : null}
      </CardBody>
    </Card>
  );
}

/** The emphasis card: the next follow-up and the page's one primary action. */
function NextCard({ result }: { result: ResultAnalysisModel }) {
  const { t } = useLocale();
  const nextFollowUp = result.followUpRecommendations[0] ?? null;
  const scored = result.dimensions.filter((dimension) => dimension.score !== null);
  const weakest = scored.length > 1 ? weakestDimension(scored) : null;

  return (
    <section aria-labelledby="result-next-title" className="result-next">
      <h2 className="result-next__label" id="result-next-title">
        {nextFollowUp ? t("resultAnalysis.nextFollowUpLabel") : t("resultAnalysis.next")}
      </h2>
      {nextFollowUp ? (
        <Link className="result-next__title" to={routeConfig.questionDetail.buildPath({ questionId: nextFollowUp.id })}>
          {nextFollowUp.title}
        </Link>
      ) : (
        <p className="result-next__title">{result.recommendedNextStep ?? t("resultAnalysis.defaultNextStep")}</p>
      )}
      {weakest ? (
        <span className="result-next__hint">
          <span aria-hidden="true" className="result-next__dot" />
          {t("resultAnalysis.coversWeakest", { dimension: weakest.label, score: weakest.score ?? 0 })}
        </span>
      ) : null}
      <ButtonLink
        fullWidth
        to={routeConfig.answerEditor.buildPath({ questionId: nextFollowUp ? nextFollowUp.id : result.questionId })}
        variant="primary"
      >
        {nextFollowUp ? t("resultAnalysis.continueAnswering") : t("resultAnalysis.answerAgain")}
      </ButtonLink>
    </section>
  );
}

function InfoRow({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="result-info__row">
      <Icon className="result-info__icon" name={icon} size={18} />
      <span className="result-info__label">{label}</span>
      {children}
    </div>
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

  return <ResultView result={result} />;
}

function ResultView({ result }: { result: ResultAnalysisModel }) {
  const { t } = useLocale();
  const { previousScore, submittedAtLabel } = useAttemptHistory(result);
  const [modelAnswerOpen, setModelAnswerOpen] = useState(false);
  const modelAnswerId = useId();
  const otherFollowUps = result.followUpRecommendations.slice(1, 4);
  const hasFollowUp = result.followUpRecommendations.length > 0;
  const attemptLine = [
    submittedAtLabel,
    result.attemptNumber ? t("resultAnalysis.attemptNumber", { count: result.attemptNumber }) : null,
  ].filter(Boolean);

  return (
    <div className="ui-page result-page">
      <header className="result-topbar">
        <Link className="result-topbar__back" to={routeConfig.questionDetail.buildPath({ questionId: result.questionId })}>
          <Icon className="result-topbar__back-icon" name="chevronRight" size={18} />
          {t("resultAnalysis.backToQuestion")}
        </Link>
        <h1 className="result-topbar__title">{t("resultAnalysis.titleWithQuestion", { title: result.questionTitle })}</h1>
        {attemptLine.length > 0 ? <span className="result-topbar__meta">{attemptLine.join(" · ")}</span> : null}
      </header>

      <div className="result-layout">
        <div className="result-layout__main">
          <ScoreCard previousScore={previousScore} result={result} />
          <AnswerCard result={result} />
          {result.modelAnswer && modelAnswerOpen ? (
            <Card aria-labelledby={`${modelAnswerId}-title`} id={modelAnswerId}>
              <CardHeader titleAs="h2" title={<span id={`${modelAnswerId}-title`}>{t("resultAnalysis.modelAnswer")}</span>} />
              <CardBody>
                <p className="result-answer">{result.modelAnswer.text}</p>
              </CardBody>
            </Card>
          ) : null}
          <FeedbackCard result={result} />
        </div>

        <aside aria-label={t("resultAnalysis.asideLabel")} className="result-layout__aside">
          <NextCard result={result} />

          {result.nextReviewLabel || result.modelAnswer || hasFollowUp ? (
            <Card className="result-info">
              {result.nextReviewLabel ? (
                <InfoRow icon="review" label={t("resultAnalysis.reviewScheduled")}>
                  <span className="result-info__value">{result.nextReviewLabel}</span>
                </InfoRow>
              ) : null}
              {result.modelAnswer ? (
                <InfoRow icon="bookmark" label={t("resultAnalysis.compareModelAnswer")}>
                  <Button
                    aria-controls={modelAnswerId}
                    aria-expanded={modelAnswerOpen}
                    onClick={() => setModelAnswerOpen((open) => !open)}
                    size="sm"
                    variant="ghost"
                  >
                    {modelAnswerOpen ? t("resultAnalysis.close") : t("resultAnalysis.open")}
                  </Button>
                </InfoRow>
              ) : null}
              {hasFollowUp ? (
                <InfoRow icon="arrowRight" label={t("resultAnalysis.sameQuestionAgain")}>
                  <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: result.questionId })} variant="ghost">
                    {t("resultAnalysis.answerAgain")}
                  </ButtonLink>
                </InfoRow>
              ) : null}
            </Card>
          ) : null}

          {otherFollowUps.length > 0 ? (
            <Card aria-labelledby="result-followups-title">
              <CardHeader titleAs="h2" title={<span id="result-followups-title">{t("resultAnalysis.likelyFollowUps")}</span>} />
              {otherFollowUps.map((item) => (
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
