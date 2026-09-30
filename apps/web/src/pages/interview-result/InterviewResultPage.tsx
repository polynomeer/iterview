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

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

function QuestionRow({ question }: { question: InterviewSessionQuestionModel }) {
  const copy = useCopy();
  const status = question.status.toLowerCase();
  return (
    <ListRow
      className={question.isFollowUp ? "interview-result-row interview-result-row--follow-up" : "interview-result-row"}
      meta={
        <span className="interview-result-row__meta">
          {question.isFollowUp ? <span>{copy(`꼬리질문 · 깊이 ${question.depth + 1}`, `Follow-up · depth ${question.depth + 1}`)}</span> : null}
          {question.categoryName ? <span>{question.categoryName}</span> : null}
          {status === "skipped" ? <Badge tone="warning">{copy("건너뜀", "Skipped")}</Badge> : null}
          {status !== "answered" && status !== "skipped" ? <Badge>{copy("답하지 않음", "Not answered")}</Badge> : null}
        </span>
      }
      title={question.title}
      trailing={
        <span className="interview-result-row__actions">
          {question.answerAttemptId ? (
            <ButtonLink size="sm" to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: question.answerAttemptId })} variant="ghost">
              {copy("평가 보기", "See feedback")}
            </ButtonLink>
          ) : null}
          {question.questionId ? (
            <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: question.questionId })}>
              {copy("다시 답하기", "Answer again")}
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
  const copy = useCopy();
  const coverageQuery = useInterviewSessionCoverageQuery(sessionId, true);
  const coverage = coverageQuery.data;

  if (coverageQuery.isError) {
    return (
      <Card padded>
        <p className="interview-result-muted">
          {copy("이력서 점검 범위를 불러오지 못했어요. ", "We couldn't load resume coverage. ")}
          <Button onClick={() => void coverageQuery.refetch()} size="sm" variant="ghost">
            {copy("다시 시도", "Try again")}
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
        {copy("이력서 점검 범위", "Resume coverage")}
      </h2>
      <Progress label={copy("점검한 비율", "Covered")} value={coverage.overallCoveragePercent} />
      <p className="interview-result-muted">
        {copy(`${coverage.overallCoveragePercent}% 점검 · ${coverage.defendedCoveragePercent}% 방어`, `${coverage.overallCoveragePercent}% covered · ${coverage.defendedCoveragePercent}% defended`)}
      </p>
      <FacetList facets={coverage.weakFacetSummaries} title={copy("방어가 약했던 부분", "Weakly defended")} tone="danger" />
      <FacetList facets={coverage.skippedFacetSummaries} title={copy("건너뛴 부분", "Skipped")} tone="warning" />
    </Card>
  );
}

/** 면접 결과: the average, every question with its feedback, and what to practice next. */
export function InterviewResultPage() {
  const { t } = useLocale();
  const copy = useCopy();
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const sessionQuery = useInterviewSessionDetailQuery(sessionId);
  const session = sessionQuery.data ?? null;

  if (sessionQuery.isLoading) {
    return <PageSkeleton label={copy("면접 결과를 불러오는 중", "Loading the interview result")} />;
  }

  if (sessionQuery.isError || !session) {
    const notFound = !sessionQuery.isError || (sessionQuery.error instanceof ApiClientError && sessionQuery.error.status === 404);
    return (
      <ErrorState
        actions={
          notFound ? (
            <ButtonLink to={routeConfig.interview.buildPath()} variant="primary">
              {copy("새 모의면접", "New mock interview")}
            </ButtonLink>
          ) : (
            <Button onClick={() => void sessionQuery.refetch()} variant="primary">
              {t("common.tryAgain")}
            </Button>
          )
        }
        body={notFound ? copy("삭제되었거나 다른 계정의 면접일 수 있어요.", "It may have been deleted or belong to another account.") : userFacingErrorMessage(sessionQuery.error, t("result.loadErrorBody"))}
        details={getErrorDetails(sessionQuery.error)}
        icon={notFound ? "search" : undefined}
        size="page"
        title={notFound ? copy("면접 결과를 찾을 수 없어요", "We couldn't find this result") : t("result.loadErrorTitle")}
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
              {copy("면접 이어서 하기", "Continue the interview")}
            </ButtonLink>
          ) : (
            <ButtonLink to={routeConfig.interview.buildPath()}>{copy("새 모의면접", "New mock interview")}</ButtonLink>
          )
        }
        description={[session.sessionType === "review_mock" ? copy("복습 질문", "Review questions") : copy("이력서 기반", "Resume-based"), interviewModeLabel(session.interviewMode, session.interviewModeLabel, t), session.endedAt].filter(Boolean).join(" · ")}
        title={inProgress ? copy("면접 중간 결과", "Interview so far") : copy("면접 결과", "Interview result")}
      />

      <Card aria-label={copy("요약", "Summary")} className="interview-result-hero" padded>
        <Stat label={copy("평균 점수", "Average score")} tone={average === null || Number.isNaN(average) ? "neutral" : scoreTone(average)} value={session.summary.averageScoreLabel ?? "-"} />
        <Stat label={copy("답변", "Answered")} value={`${answered} / ${session.questions.length}`} />
        <Stat label={copy("건너뜀", "Skipped")} tone={skipped > 0 ? "warning" : "neutral"} value={skipped} />
        <div className="interview-result-hero__next">
          <span className="interview-result-muted">{copy("다음 할 일", "Next")}</span>
          <p>
            {retryable.length > 0
              ? copy(`답하지 못한 질문 ${retryable.length}개부터 다시 연습하세요.`, `Practice the ${retryable.length} questions you didn't answer first.`)
              : copy("평가가 낮은 답변부터 다시 답해보세요. 답변한 질문은 복습 목록에 올라가요.", "Retry the lowest-scored answers first. Answered questions go to your review list.")}
          </p>
          <div className="interview-result-hero__actions">
            {nextQuestion?.questionId ? (
              <ButtonLink to={routeConfig.answerEditor.buildPath({ questionId: nextQuestion.questionId })} variant="primary">
                {copy("다시 답하기", "Answer again")}
              </ButtonLink>
            ) : null}
            <ButtonLink to={routeConfig.reviewQueue.buildPath()} variant="ghost">
              {copy("복습 목록", "Review list")}
            </ButtonLink>
          </div>
        </div>
      </Card>

      <div className="interview-outcome-layout">
        <Card aria-labelledby="interview-result-questions-title">
          <CardHeader title={<span id="interview-result-questions-title">{copy(`질문 ${session.questions.length}`, `Questions ${session.questions.length}`)}</span>} titleAs="h2" />
          {session.questions.length === 0 ? (
            <CardBody>
              <p className="interview-result-muted">{copy("받은 질문이 없어요.", "No questions were asked.")}</p>
            </CardBody>
          ) : (
            session.questions.map((question) => <QuestionRow key={question.id} question={question} />)
          )}
        </Card>
        {session.interviewMode === "full_coverage" ? (
          <aside aria-label={copy("이력서 점검 범위", "Resume coverage")} className="interview-result-aside">
            <CoverageCard sessionId={sessionId} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
