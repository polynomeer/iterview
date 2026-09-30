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
import { useLocale } from "../../shared/i18n";
import { Badge, Button, ButtonLink, Callout, Card, ErrorState, PageSkeleton, Progress } from "../../shared/ui/primitives";
import "./session.css";

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

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

const STATUS: Record<string, [string, string, "success" | "neutral" | "accent" | "warning"]> = {
  answered: ["답변함", "Answered", "success"],
  skipped: ["건너뜀", "Skipped", "warning"],
  current: ["지금", "Now", "accent"],
};

/** The questions so far, follow-ups indented under the question they came from. */
function QuestionFlow({ session, currentId }: { session: InterviewSessionModel; currentId: string }) {
  const copy = useCopy();
  return (
    <Card aria-labelledby="session-flow-title" className="session-flow" padded>
      <h2 className="session-flow__title" id="session-flow-title">
        {copy("질문 흐름", "Question flow")}
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
              {status ? <Badge tone={status[2]}>{copy(status[0], status[1])}</Badge> : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function CoverageCard({ sessionId }: { sessionId: string }) {
  const copy = useCopy();
  const coverageQuery = useInterviewSessionCoverageQuery(sessionId, true);
  const coverage = coverageQuery.data;
  if (!coverage) {
    return null;
  }
  const weak = coverage.weakFacetSummaries.slice(0, 4);
  return (
    <Card aria-labelledby="session-coverage-title" padded>
      <h2 className="session-flow__title" id="session-coverage-title">
        {copy("이력서 점검 범위", "Resume coverage")}
      </h2>
      <Progress label={copy("점검한 비율", "Covered")} value={coverage.overallCoveragePercent} />
      <p className="session-muted">{copy(`${coverage.overallCoveragePercent}% 점검 · 방어 ${coverage.defendedCoveragePercent}%`, `${coverage.overallCoveragePercent}% covered · ${coverage.defendedCoveragePercent}% defended`)}</p>
      {weak.length > 0 ? (
        <>
          <h3 className="session-subtitle">{copy("다시 물어볼 부분", "Coming back to")}</h3>
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
  const copy = useCopy();
  const kicker = question.isFollowUp
    ? copy(`꼬리질문 · 깊이 ${question.depth + 1}`, `Follow-up · depth ${question.depth + 1}`)
    : copy(`질문 ${index}`, `Question ${index}`);
  return (
    <header className="session-question">
      <p className="session-question__kicker">
        {kicker}
        {question.categoryName ? ` · ${question.categoryName}` : ""}
        {total > 0 ? <span className="ui-visually-hidden">{copy(` (전체 ${total}문항)`, ` (of ${total})`)}</span> : null}
      </p>
      <h1 className="session-question__title">{question.title}</h1>
      {question.bodyText && question.bodyText !== question.title ? <p className="session-question__body">{question.bodyText}</p> : null}
      {question.revisitLabel ? <Badge tone="warning">{question.revisitLabel}</Badge> : null}
      {question.resumeContextSummary || question.resumeEvidence.length > 0 ? (
        <details className="session-evidence">
          <summary>{copy("이력서의 어느 부분에 대한 질문인가요?", "Which part of my resume is this about?")}</summary>
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
  const copy = useCopy();
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
        {copy("나가기", "Exit")}
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
          <PageSkeleton label={copy("면접을 불러오는 중", "Loading the interview")} />
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
                  {copy("새 면접 시작", "Start a new interview")}
                </ButtonLink>
              ) : (
                <Button onClick={() => void sessionQuery.refetch()} variant="primary">
                  {t("common.tryAgain")}
                </Button>
              )
            }
            body={
              finished
                ? copy("남은 질문이 없어요. 결과를 확인하세요.", "No questions left. Check the result.")
                : notFound
                  ? copy("삭제되었거나 다른 계정의 면접일 수 있어요.", "It may have been deleted or belong to another account.")
                  : userFacingErrorMessage(sessionQuery.error, t("interview.sessionUnavailableBody"))
            }
            details={getErrorDetails(sessionQuery.error)}
            icon={finished ? "check" : notFound ? "search" : undefined}
            size="page"
            title={finished ? copy("모든 질문에 답했어요", "All questions answered") : notFound ? copy("면접을 찾을 수 없어요", "We couldn't find this interview") : t("interview.sessionUnavailableTitle")}
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
    optionalErrorMessage(skipMutation.error, copy("건너뛰지 못했어요.", "We couldn't skip.")) ??
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
          {copy("나가기", "Exit")}
        </ButtonLink>
        <span className="session-bar__position">
          {position} / {total}
        </span>
        <div className="session-bar__progress">
          <Progress label={copy("답변한 질문", "Answered")} value={total > 0 ? Math.round((answered / total) * 100) : 0} />
        </div>
        <span className="session-bar__timer">
          <span className="ui-visually-hidden">{copy("경과 시간", "Elapsed time")}</span>
          {elapsed}
        </span>
      </header>

      <main className="session-main session-layout">
        <section aria-label={copy("현재 질문", "Current question")} className="session-stage">
          <QuestionHeader index={position} question={currentQuestion} total={total} />

          {isCurrent ? (
            <div className="session-answer">
              <label className="ui-visually-hidden" htmlFor={editorId}>
                {copy("답변", "Your answer")}
              </label>
              <textarea
                autoFocus
                className="session-answer__input"
                disabled={busy}
                id={editorId}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={copy("면접관에게 말하듯 결론부터 답하세요.", "Answer as you would out loud: conclusion first.")}
                value={draft}
              />
              <div className="session-answer__footer">
                <span className="session-muted">
                  {copy(`${trimmed.length}자`, `${trimmed.length} chars`)}
                  <span className="session-answer__shortcut">{copy(" · ⌘/Ctrl+Enter로 제출", " · ⌘/Ctrl+Enter to submit")}</span>
                </span>
                <Button disabled={busy} onClick={() => void skip()} variant="ghost">
                  {copy("건너뛰기", "Skip")}
                </Button>
                <Button disabled={!trimmed || busy} loading={submitMutation.isPending} onClick={() => void submit()} variant="primary">
                  {t("interview.submitAnswer")}
                </Button>
              </div>
            </div>
          ) : (
            <Callout title={copy("이 질문은 끝났어요", "This question is done")} tone="success">
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

        <aside aria-label={copy("면접 진행", "Interview progress")} className="session-aside">
          <QuestionFlow currentId={currentQuestion.id} session={activeSession} />
          {activeSession.interviewMode === "full_coverage" ? <CoverageCard sessionId={sessionId} /> : null}
        </aside>
      </main>
    </div>
  );
}
