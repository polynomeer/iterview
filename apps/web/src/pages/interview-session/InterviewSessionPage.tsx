import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  canAdvanceInterviewSession,
  getAnsweredQuestionCount,
  type InterviewSessionModel,
  type InterviewSessionQuestionModel,
} from "../../entities/interview/model";
import { useAdvanceInterviewSessionMutation } from "../../features/interview/api/useAdvanceInterviewSessionMutation";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { useSkipInterviewSessionQuestionMutation } from "../../features/interview/api/useSkipInterviewSessionQuestionMutation";
import { useSubmitInterviewSessionAnswerMutation } from "../../features/interview/api/useSubmitInterviewSessionAnswerMutation";
import { ApiClientError, getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { Badge, Button, ButtonLink, Callout, Card, ErrorState, PageSkeleton, Progress } from "../../shared/ui/primitives";
import "./session.css";

function useElapsed(startedAt: string | null) {
  const [now, setNow] = useState(() => Date.now());
  const [mountedAt] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const start = Date.parse(startedAt ?? "") || mountedAt;
  const seconds = Math.max(0, Math.floor((now - start) / 1000));
  const hours = Math.floor(seconds / 3600);
  const clock = `${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
}

const STATUS: Record<string, { label: MessageKey; tone: "success" | "neutral" | "accent" | "warning" }> = {
  answered: { label: "interviewSession.statusAnswered", tone: "success" },
  skipped: { label: "interviewSession.statusSkipped", tone: "warning" },
  current: { label: "interviewSession.statusCurrent", tone: "accent" },
};

/** The questions so far, follow-ups indented under the question they came from. */
function QuestionFlow({ session, currentId }: { session: InterviewSessionModel; currentId: string }) {
  const { t } = useLocale();
  return (
    <Card aria-labelledby="session-flow-title" className="session-flow" padded>
      <h2 className="session-flow__title" id="session-flow-title">
        {t("interviewSession.questionFlow")}
      </h2>
      <ol className="session-flow__list">
        {session.questions.map((question) => {
          const status = STATUS[question.status.toLowerCase()];
          return (
            <li
              aria-current={question.id === currentId ? "step" : undefined}
              className="session-flow__item"
              key={question.id}
              style={{ paddingLeft: `calc(${Math.min(question.depth, 4)} * var(--iv-space-4))` }}
            >
              <span className="session-flow__text">{question.title}</span>
              {status ? <Badge tone={status.tone}>{t(status.label)}</Badge> : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function CoverageCard({ sessionId }: { sessionId: string }) {
  const { t } = useLocale();
  const coverageQuery = useInterviewSessionCoverageQuery(sessionId, true);
  const coverage = coverageQuery.data;
  if (!coverage) {
    return null;
  }
  const weak = coverage.weakFacetSummaries.slice(0, 4);
  return (
    <Card aria-labelledby="session-coverage-title" padded>
      <h2 className="session-flow__title" id="session-coverage-title">
        {t("interviewSession.resumeCoverage")}
      </h2>
      <Progress label={t("interviewSession.covered")} value={coverage.overallCoveragePercent} />
      <p className="session-muted">{t("interviewSession.coverageSummary", { overallCoveragePercent: coverage.overallCoveragePercent, defendedCoveragePercent: coverage.defendedCoveragePercent })}</p>
      {weak.length > 0 ? (
        <>
          <h3 className="session-subtitle">{t("interviewSession.comingBackTo")}</h3>
          <ul className="session-weak">
            {weak.map((facet) => (
              <li key={facet.id}>{facet.label ?? facet.sectionLabel}</li>
            ))}
          </ul>
        </>
      ) : null}
    </Card>
  );
}

function QuestionHeader({ question, index, total }: { question: InterviewSessionQuestionModel; index: number; total: number }) {
  const { t } = useLocale();
  const kicker = question.isFollowUp
    ? t("interviewSession.followUpDepth", { depth: question.depth + 1 })
    : t("interviewSession.questionNumber", { index });
  return (
    <header className="session-question">
      <p className="session-question__kicker">
        {kicker}
        {question.categoryName ? ` · ${question.categoryName}` : ""}
        {total > 0 ? <span className="ui-visually-hidden">{t("interviewSession.totalQuestionsHint", { total })}</span> : null}
      </p>
      <h1 className="session-question__title">{question.title}</h1>
      {question.bodyText && question.bodyText !== question.title ? <p className="session-question__body">{question.bodyText}</p> : null}
      {question.revisitLabel ? <Badge tone="warning">{question.revisitLabel}</Badge> : null}
      {question.resumeContextSummary || question.resumeEvidence.length > 0 ? (
        <details className="session-evidence">
          <summary>{t("interviewSession.whichPartOfMyResume")}</summary>
          {question.resumeContextSummary ? <p>{question.resumeContextSummary}</p> : null}
          <ul>
            {question.resumeEvidence.map((evidence) => (
              <li key={evidence.id}>
                {evidence.label ? <strong>{evidence.label}</strong> : null} {evidence.snippet}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </header>
  );
}

/** A live mock interview in focus mode: one question, the answer box, and the flow so far. */
export function InterviewSessionPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const editorId = useId();
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const [draft, setDraft] = useState("");
  const sessionQuery = useInterviewSessionDetailQuery(sessionId);
  const submitMutation = useSubmitInterviewSessionAnswerMutation();
  const advanceMutation = useAdvanceInterviewSessionMutation();
  const skipMutation = useSkipInterviewSessionQuestionMutation();
  const session = sessionQuery.data ?? null;
  const elapsed = useElapsed(session?.startedAt ?? null);
  const resultPath = routeConfig.interviewSessionResult.buildPath({ sessionId });
  const exitBar = (
    <header className="session-bar">
      <ButtonLink icon="close" size="sm" to={routeConfig.interview.buildPath()} variant="ghost">
        {t("interviewSession.exit")}
      </ButtonLink>
    </header>
  );

  useEffect(() => {
    if (sessionId && session?.status === "completed") {
      navigate(resultPath);
    }
  }, [navigate, resultPath, session?.status, sessionId]);

  if (sessionQuery.isLoading) {
    return (
      <div className="session-page">
        {exitBar}
        <main className="session-main">
          <PageSkeleton label={t("interviewSession.loadingTheInterview")} />
        </main>
      </div>
    );
  }

  const question = session?.currentQuestion ?? null;

  if (sessionQuery.isError || !session || !question) {
    const notFound = sessionQuery.error instanceof ApiClientError && sessionQuery.error.status === 404;
    const finished = !sessionQuery.isError && Boolean(session);
    return (
      <div className="session-page">
        {exitBar}
        <main className="session-main">
          <ErrorState
            actions={
              finished ? (
                <ButtonLink to={resultPath} variant="primary">
                  {t("interview.viewSessionResult")}
                </ButtonLink>
              ) : notFound ? (
                <ButtonLink to={routeConfig.interview.buildPath()} variant="primary">
                  {t("interviewSession.startANewInterview")}
                </ButtonLink>
              ) : (
                <Button onClick={() => void sessionQuery.refetch()} variant="primary">
                  {t("common.tryAgain")}
                </Button>
              )
            }
            body={
              finished
                ? t("interviewSession.noQuestionsLeftCheckThe")
                : notFound
                  ? t("interviewSession.itMayHaveBeenDeleted")
                  : userFacingErrorMessage(sessionQuery.error, t("interview.sessionUnavailableBody"))
            }
            details={getErrorDetails(sessionQuery.error)}
            icon={finished ? "check" : notFound ? "search" : undefined}
            size="page"
            title={finished ? t("interviewSession.allQuestionsAnswered") : notFound ? t("interviewSession.weCouldntFindThisInterview") : t("interview.sessionUnavailableTitle")}
          />
        </main>
      </div>
    );
  }

  const activeSession = session;
  const currentQuestion = question;
  const isCurrent = currentQuestion.status.toLowerCase() === "current";
  const canAdvance = canAdvanceInterviewSession(activeSession);
  const answered = getAnsweredQuestionCount(activeSession);
  const total = Math.max(activeSession.summary.totalQuestions, activeSession.questions.length);
  // orderIndex is not reliably zero-based, so count from the question list itself.
  const position = Math.max(1, activeSession.questions.findIndex((candidate) => candidate.id === currentQuestion.id) + 1);
  const busy = submitMutation.isPending || skipMutation.isPending || advanceMutation.isPending;
  const trimmed = draft.trim();
  const isLast = activeSession.summary.remainingQuestions === 0;
  const advanceError =
    advanceMutation.error instanceof ApiClientError && advanceMutation.error.status === 409
      ? null
      : optionalErrorMessage(advanceMutation.error, t("interview.advanceFailed"));
  const error =
    optionalErrorMessage(submitMutation.error, t("interview.answerSubmissionFailed")) ??
    optionalErrorMessage(skipMutation.error, t("interviewSession.weCouldntSkip")) ??
    advanceError;

  async function submit() {
    if (!trimmed || busy || !isCurrent) {
      return;
    }
    try {
      const response = await submitMutation.mutateAsync({
        sessionId,
        payload: {
          sessionQuestionId: currentQuestion.id,
          answerMode: "text",
          contentText: trimmed,
          // Grade against the resume this session was started with, not whatever is active now.
          resumeVersionId: activeSession.resumeVersionId,
        },
      });
      setDraft("");
      if (response.status === "completed") {
        navigate(resultPath);
        return;
      }
      await sessionQuery.refetch();
    } catch {
      // Rendered through `error`.
    }
  }

  async function skip() {
    try {
      await skipMutation.mutateAsync({ sessionId, payload: { sessionQuestionId: currentQuestion.id } });
      setDraft("");
    } catch {
      // Rendered through `error`.
    }
  }

  async function advance() {
    if (!canAdvance) {
      return;
    }
    try {
      await advanceMutation.mutateAsync(sessionId);
    } catch {
      // A 409 means the session already moved on; anything else is rendered through `error`.
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="session-page">
      <header className="session-bar">
        <ButtonLink icon="close" size="sm" to={routeConfig.interview.buildPath()} variant="ghost">
          {t("interviewSession.exit")}
        </ButtonLink>
        <span className="session-bar__position">
          {position} / {total}
        </span>
        <div className="session-bar__progress">
          <Progress label={t("interviewSession.answered")} value={total > 0 ? Math.round((answered / total) * 100) : 0} />
        </div>
        <span className="session-bar__timer">
          <span className="ui-visually-hidden">{t("interviewSession.elapsedTime")}</span>
          {elapsed}
        </span>
      </header>

      <main className="session-main session-layout">
        <section aria-label={t("interviewSession.currentQuestion")} className="session-stage">
          <QuestionHeader index={position} question={currentQuestion} total={total} />

          {isCurrent ? (
            <div className="session-answer">
              <label className="ui-visually-hidden" htmlFor={editorId}>
                {t("interviewSession.yourAnswer")}
              </label>
              <textarea
                autoFocus
                className="session-answer__input"
                disabled={busy}
                id={editorId}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("interviewSession.answerAsYouWouldOut")}
                value={draft}
              />
              <div className="session-answer__footer">
                <span className="session-muted">
                  {t("interviewSession.charCount", { count: trimmed.length })}
                  <span className="session-answer__shortcut">{t("interviewSession.submitShortcutHint")}</span>
                </span>
                <Button disabled={busy} onClick={() => void skip()} variant="ghost">
                  {t("interviewSession.skip")}
                </Button>
                <Button disabled={!trimmed || busy} loading={submitMutation.isPending} onClick={() => void submit()} variant="primary">
                  {t("interview.submitAnswer")}
                </Button>
              </div>
            </div>
          ) : (
            <Callout title={t("interviewSession.thisQuestionIsDone")} tone="success">
              <div className="session-next">
                {isLast ? (
                  <ButtonLink to={resultPath} variant="primary">
                    {t("interview.finishSession")}
                  </ButtonLink>
                ) : (
                  <Button disabled={!canAdvance} loading={advanceMutation.isPending} onClick={() => void advance()} variant="primary">
                    {t("interview.nextQuestion")}
                  </Button>
                )}
              </div>
            </Callout>
          )}
          {error ? (
            <Callout tone="danger">
              {error}
              {getErrorDetails(submitMutation.error ?? skipMutation.error ?? advanceMutation.error).map((detail) => (
                <div key={detail}>{detail}</div>
              ))}
            </Callout>
          ) : null}
        </section>

        <aside aria-label={t("interviewSession.interviewProgress")} className="session-aside">
          <QuestionFlow currentId={currentQuestion.id} session={activeSession} />
          {activeSession.interviewMode === "full_coverage" ? <CoverageCard sessionId={sessionId} /> : null}
        </aside>
      </main>
    </div>
  );
}
