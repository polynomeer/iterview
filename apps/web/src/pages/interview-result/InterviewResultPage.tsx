import { useParams } from "react-router-dom";
import type { InterviewFacetSummaryModel, InterviewSessionQuestionModel } from "../../entities/interview/model";
import { getAnsweredQuestionCount } from "../../entities/interview/model";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { scoreTone } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  ListRow,
  PageHeader,
  PageSkeleton,
  Progress,
  Stat,
} from "../../shared/ui/primitives";
import { interviewModeLabel } from "../interview/modes";
import "./interview-result.css";

function QuestionRow({ question }: { question: InterviewSessionQuestionModel }) {
  const { t } = useLocale();
  const status = question.status.toLowerCase();
  return (
    <ListRow
      className={question.isFollowUp ? "interview-result-row interview-result-row--follow-up" : "interview-result-row"}
      meta={
        <span className="interview-result-row__meta">
          {question.isFollowUp ? <span>{t("interviewResult.followUpDepth", { depth: question.depth + 1 })}</span> : null}
          {question.categoryName ? <span>{question.categoryName}</span> : null}
          {status === "skipped" ? <Badge tone="warning">{t("interviewResult.skipped")}</Badge> : null}
          {status !== "answered" && status !== "skipped" ? <Badge>{t("interviewResult.notAnswered")}</Badge> : null}
        </span>
      }
      title={question.title}
      trailing={
        <span className="interview-result-row__actions">
          {question.answerAttemptId ? (
            <ButtonLink size="sm" to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: question.answerAttemptId })} variant="ghost">
              {t("interviewResult.seeFeedback")}
            </ButtonLink>
          ) : null}
          {question.questionId ? (
            <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: question.questionId })}>
              {t("interviewResult.answerAgain")}
            </ButtonLink>
          ) : null}
        </span>
      }
    />
  );
}

function FacetList({ title, facets, tone }: { title: string; facets: InterviewFacetSummaryModel[]; tone: "danger" | "warning" }) {
  if (facets.length === 0) {
    return null;
  }
  return (
    <div>
      <h3 className="interview-result-subtitle">{title}</h3>
      <ul className="interview-result-facets">
        {facets.map((facet) => (
          <li key={facet.id}>
            <Badge tone={tone}>{facet.sectionLabel}</Badge>
            <span>{facet.label ?? [...facet.weakFacets, ...facet.skippedFacets].join(", ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Coverage of the resume for full-coverage sessions: what was defended and what to revisit. */
function CoverageCard({ sessionId }: { sessionId: string }) {
  const { t } = useLocale();
  const coverageQuery = useInterviewSessionCoverageQuery(sessionId, true);
  const coverage = coverageQuery.data;

  if (coverageQuery.isError) {
    return (
      <Card padded>
        <p className="interview-result-muted">
          {t("interviewResult.weCouldntLoadResumeCoverage")}
          <Button onClick={() => void coverageQuery.refetch()} size="sm" variant="ghost">
            {t("interviewResult.tryAgain")}
          </Button>
        </p>
      </Card>
    );
  }
  if (!coverage) {
    return null;
  }

  return (
    <Card aria-labelledby="interview-result-coverage-title" padded>
      <h2 className="interview-result-card-title" id="interview-result-coverage-title">
        {t("interviewResult.resumeCoverage")}
      </h2>
      <Progress label={t("interviewResult.covered")} value={coverage.overallCoveragePercent} />
      <p className="interview-result-muted">
        {t("interviewResult.coverageSummary", { overallCoveragePercent: coverage.overallCoveragePercent, defendedCoveragePercent: coverage.defendedCoveragePercent })}
      </p>
      <FacetList facets={coverage.weakFacetSummaries} title={t("interviewResult.weaklyDefended")} tone="danger" />
      <FacetList facets={coverage.skippedFacetSummaries} title={t("interviewResult.skippedArea")} tone="warning" />
    </Card>
  );
}

/** 면접 결과: the average, every question with its feedback, and what to practice next. */
export function InterviewResultPage() {
  const { t } = useLocale();
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const sessionQuery = useInterviewSessionDetailQuery(sessionId);
  const session = sessionQuery.data ?? null;

  if (sessionQuery.isLoading) {
    return <PageSkeleton label={t("interviewResult.loadingTheInterviewResult")} />;
  }

  if (sessionQuery.isError || !session) {
    const notFound = !sessionQuery.isError || (sessionQuery.error instanceof ApiClientError && sessionQuery.error.status === 404);
    return (
      <ErrorState
        actions={
          notFound ? (
            <ButtonLink to={routeConfig.interview.buildPath()} variant="primary">
              {t("interviewResult.newMockInterview")}
            </ButtonLink>
          ) : (
            <Button onClick={() => void sessionQuery.refetch()} variant="primary">
              {t("common.tryAgain")}
            </Button>
          )
        }
        body={notFound ? t("interviewResult.itMayHaveBeenDeleted") : userFacingErrorMessage(sessionQuery.error, t("result.loadErrorBody"))}
        details={getErrorDetails(sessionQuery.error)}
        icon={notFound ? "search" : undefined}
        size="page"
        title={notFound ? t("interviewResult.weCouldntFindThisResult") : t("result.loadErrorTitle")}
      />
    );
  }

  const answered = getAnsweredQuestionCount(session);
  const skipped = session.summary.skippedQuestions;
  const average = session.summary.averageScoreLabel === null ? null : Number(session.summary.averageScoreLabel);
  const inProgress = session.status !== "completed";
  const retryable = session.questions.filter((question) => question.questionId && question.status.toLowerCase() !== "answered");
  const nextQuestion = retryable[0] ?? session.questions.find((question) => question.questionId) ?? null;

  return (
    <div className="ui-page">
      <PageHeader
        actions={
          inProgress ? (
            <ButtonLink to={routeConfig.interviewSession.buildPath({ sessionId })} variant="primary">
              {t("interviewResult.continueTheInterview")}
            </ButtonLink>
          ) : (
            <ButtonLink to={routeConfig.interview.buildPath()}>{t("interviewResult.newMockInterview")}</ButtonLink>
          )
        }
        description={[session.sessionType === "review_mock" ? t("interviewResult.reviewQuestions") : t("interviewResult.resumeBased"), interviewModeLabel(session.interviewMode, session.interviewModeLabel, t), session.endedAt].filter(Boolean).join(" · ")}
        title={inProgress ? t("interviewResult.interviewSoFar") : t("interviewResult.interviewResult")}
      />

      <Card aria-label={t("interviewResult.summary")} className="interview-result-hero" padded>
        <Stat label={t("interviewResult.averageScore")} tone={average === null || Number.isNaN(average) ? "neutral" : scoreTone(average)} value={session.summary.averageScoreLabel ?? "-"} />
        <Stat label={t("interviewResult.answered")} value={`${answered} / ${session.questions.length}`} />
        <Stat label={t("interviewResult.skipped")} tone={skipped > 0 ? "warning" : "neutral"} value={skipped} />
        <div className="interview-result-hero__next">
          <span className="interview-result-muted">{t("interviewResult.next")}</span>
          <p>
            {retryable.length > 0
              ? t("interviewResult.practiceUnansweredFirst", { count: retryable.length })
              : t("interviewResult.retryTheLowestScoredAnswers")}
          </p>
          <div className="interview-result-hero__actions">
            {nextQuestion?.questionId ? (
              <ButtonLink to={routeConfig.answerEditor.buildPath({ questionId: nextQuestion.questionId })} variant="primary">
                {t("interviewResult.answerAgain")}
              </ButtonLink>
            ) : null}
            <ButtonLink to={routeConfig.reviewQueue.buildPath()} variant="ghost">
              {t("interviewResult.reviewList")}
            </ButtonLink>
          </div>
        </div>
      </Card>

      <div className="interview-outcome-layout">
        <Card aria-labelledby="interview-result-questions-title">
          <CardHeader title={<span id="interview-result-questions-title">{t("interviewResult.questionsCount", { count: session.questions.length })}</span>} titleAs="h2" />
          {session.questions.length === 0 ? (
            <CardBody>
              <p className="interview-result-muted">{t("interviewResult.noQuestionsWereAsked")}</p>
            </CardBody>
          ) : (
            session.questions.map((question) => <QuestionRow key={question.id} question={question} />)
          )}
        </Card>
        {session.interviewMode === "full_coverage" ? (
          <aside aria-label={t("interviewResult.resumeCoverage")} className="interview-result-aside">
            <CoverageCard sessionId={sessionId} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
