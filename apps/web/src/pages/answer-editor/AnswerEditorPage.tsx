import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getActiveResumeVersion } from "../../entities/resume/model";
import { useSubmitAnswerMutation } from "../../features/answer/api/useSubmitAnswerMutation";
import { useAnswerDraft } from "../../features/answer/model/useAnswerDraft";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { ApiClientError, getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { difficultyLabel, scoreTone } from "../../shared/lib/labels";
import { Button, ButtonLink, Callout, ErrorState, Icon, PageSkeleton } from "../../shared/ui/primitives";
import "./answer.css";

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function useElapsedSeconds() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const intervalId = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, []);
  return seconds;
}

function countSentences(text: string) {
  return text.split(/[.!?。]+|\n+/).map((part) => part.trim()).filter(Boolean).length;
}

/** The last evaluation's score and advice, shown right above the editor when retrying. */
function LastFeedback({ answerAttemptId, score }: { answerAttemptId: string; score: number | null }) {
  const { t } = useLocale();
  const resultQuery = useResultAnalysisQuery(answerAttemptId);
  const advice = resultQuery.data?.recommendedNextStep ?? resultQuery.data?.weaknessSummary ?? resultQuery.data?.improvementPoints[0] ?? null;

  if (!advice && score === null) {
    return null;
  }

  return (
    <aside aria-label={t("answerEditor.lastFeedback")} className={`answer-feedback answer-feedback--${scoreTone(score)}`}>
      {score !== null ? (
        <span className="answer-feedback__score">
          <span className="ui-visually-hidden">{t("answerEditor.lastScore", { score })}</span>
          <span aria-hidden="true">{score}</span>
        </span>
      ) : null}
      <p className="answer-feedback__text">
        <strong>{t("answerEditor.lastFeedback")}</strong>
        {advice ? ` — ${advice}` : null}
      </p>
    </aside>
  );
}

const CHECKLIST: Array<[MessageKey, MessageKey]> = [
  ["answerEditor.checklistClaimTitle", "answerEditor.checklistClaimBody"],
  ["answerEditor.checklistEvidenceTitle", "answerEditor.checklistEvidenceBody"],
  ["answerEditor.checklistFollowUpTitle", "answerEditor.checklistFollowUpBody"],
];

export function AnswerEditorPage() {
  const navigate = useNavigate();
  const { questionId = "" } = useParams<{ questionId: string }>();
  const { locale, t } = useLocale();
  const location = useLocation();
  const stateDepth = (location.state as { depth?: unknown } | null)?.depth;
  const depth = typeof stateDepth === "number" && stateDepth > 0 ? stateDepth : null;
  const editorId = useId();
  const questionQuery = useQuestionDetailQuery(questionId);
  const historyQuery = useQuestionAnswerHistoryQuery(questionId);
  const resumeListQuery = useResumeListQuery();
  const submitMutation = useSubmitAnswerMutation();
  const { draft, setDraft, clearDraft, hasDraft } = useAnswerDraft(questionId);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const elapsed = useElapsedSeconds();
  const trimmedDraft = draft.trim();
  const activeResume = getActiveResumeVersion(resumeListQuery.data);
  const activeResumeVersionId = activeResume?.id ?? null;
  const latestAttempt = historyQuery.data?.items[0] ?? null;
  const question = questionQuery.data ?? null;
  const questionPath = routeConfig.questionDetail.buildPath({ questionId });
  const validationMessage = hasTriedSubmit && trimmedDraft.length === 0 ? t("answer.validationWriteResponse") : null;
  const submitError = optionalErrorMessage(submitMutation.error, t("common.requestFailedBody"));

  async function handleSubmit() {
    setHasTriedSubmit(true);
    if (!questionId || trimmedDraft.length === 0 || submitMutation.isPending) {
      return;
    }

    try {
      const response = await submitMutation.mutateAsync({ questionId, resumeVersionId: activeResumeVersionId, contentText: trimmedDraft });
      clearDraft();
      navigate(routeConfig.resultAnalysis.buildPath({ answerAttemptId: String(response.answerAttemptId) }));
    } catch {
      // The mutation error is rendered below the editor.
    }
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  }

  const focusBar = (
    <header className="answer-focus-bar">
      <ButtonLink className="answer-focus-bar__exit" icon="close" size="sm" to={questionPath} variant="ghost">
        {t("answerEditor.exit")}
      </ButtonLink>
      <span aria-hidden="true" className="answer-focus-bar__rule" />
      <nav aria-label={t("answerEditor.youAreHere")} className="answer-focus-bar__path">
        <Link to={routeConfig.practice.buildPath()}>{t("answerEditor.questions")}</Link>
        {question ? (
          <>
            <Icon name="chevronRight" size={14} />
            <Link to={questionPath}>{question.category}</Link>
            <Icon name="chevronRight" size={14} />
            <span aria-current="page" className="answer-focus-bar__current">
              {question.title}
            </span>
          </>
        ) : null}
      </nav>
      <span aria-live="polite" className="answer-focus-bar__saved">
        {hasDraft ? t("answerEditor.savedInBrowser") : ""}
      </span>
      <span className="answer-focus-bar__timer">
        <span className="ui-visually-hidden">{t("answerEditor.elapsedTime")}</span>
        {formatElapsed(elapsed)}
      </span>
    </header>
  );

  if (questionQuery.isLoading) {
    return (
      <div className="answer-page iv-ink-focus">
        {focusBar}
        <main className="answer-layout">
          <PageSkeleton label={t("answerEditor.loadingQuestion")} />
        </main>
      </div>
    );
  }

  if (questionQuery.isError || !question) {
    const notFound = !questionQuery.isError || (questionQuery.error instanceof ApiClientError && questionQuery.error.status === 404);
    return (
      <div className="answer-page iv-ink-focus">
        {focusBar}
        <main className="answer-layout answer-layout--single">
          <ErrorState
            actions={
              notFound ? (
                <ButtonLink to={routeConfig.practice.buildPath()} variant="primary">
                  {t("common.backToPractice")}
                </ButtonLink>
              ) : (
                <Button onClick={() => void questionQuery.refetch()} variant="primary">
                  {t("common.tryAgain")}
                </Button>
              )
            }
            body={notFound ? t("answer.unavailableBody") : userFacingErrorMessage(questionQuery.error, t("answer.loadErrorBody"))}
            details={getErrorDetails(questionQuery.error)}
            size="page"
            title={notFound ? t("answer.unavailableTitle") : t("answer.loadErrorTitle")}
          />
        </main>
      </div>
    );
  }

  const difficulty = difficultyLabel(question.difficulty, locale);
  const referenceAnswer = question.referenceAnswers[0] ?? null;
  const attempt = historyQuery.data ? historyQuery.data.items.length + 1 : null;
  const attemptLine = [
    depth !== null ? t("answerEditor.depth", { depth }) : null,
    attempt !== null ? (attempt > 1 ? t("answerEditor.attemptNumber", { count: attempt }) : t("answerEditor.firstAttempt")) : null,
    difficulty,
  ].filter(Boolean);

  return (
    <div className="answer-page iv-ink-focus">
      {focusBar}
      <main className="answer-layout">
        <section aria-labelledby="answer-question" className="answer-main">
          <div className="answer-main__head">
            {attemptLine.length > 0 ? <p className="answer-main__attempt">{attemptLine.join(" · ")}</p> : null}
            <h1 className="answer-main__question" id="answer-question">
              {question.title}
            </h1>
          </div>
          {latestAttempt ? <LastFeedback answerAttemptId={latestAttempt.answerAttemptId} score={latestAttempt.totalScore ?? null} /> : null}
          {!resumeListQuery.isLoading && !resumeListQuery.isError && !activeResumeVersionId ? (
            <Callout>{t("answer.noActiveResumeInfo")}</Callout>
          ) : null}

          <div className="answer-editor">
            <label className="ui-visually-hidden" htmlFor={editorId}>
              {t("answerEditor.yourAnswer")}
            </label>
            <textarea
              aria-describedby={validationMessage ? `${editorId}-error` : `${editorId}-hint`}
              aria-invalid={validationMessage ? true : undefined}
              autoFocus
              className="answer-editor__input"
              id={editorId}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleEditorKeyDown}
              placeholder={t("answer.editorPlaceholder")}
              value={draft}
            />
          </div>
          <div className="answer-editor__footer">
            <span className="answer-editor__stats" id={`${editorId}-hint`}>
              {t("answerEditor.draftStats", { chars: trimmedDraft.length, sentences: countSentences(trimmedDraft) })}
              <span className="answer-editor__shortcut">{t("answerEditor.submitShortcut")}</span>
            </span>
            <Button loading={submitMutation.isPending} onClick={() => void handleSubmit()} size="lg" variant="primary">
              {t("answerEditor.submit")}
            </Button>
          </div>
          {validationMessage ? (
            <p className="answer-editor__error" id={`${editorId}-error`} role="alert">
              {validationMessage}
            </p>
          ) : null}
          {submitError ? (
            <Callout title={t("answerEditor.submitFailed")} tone="danger">
              {submitError}
              {getErrorDetails(submitMutation.error).map((detail) => (
                <div key={detail}>{detail}</div>
              ))}
            </Callout>
          ) : null}
        </section>

        <aside aria-label={t("answerEditor.answerGuide")} className="answer-aside">
          <section aria-labelledby="answer-checklist-title" className="answer-aside__section">
            <h2 className="answer-aside__title" id="answer-checklist-title">
              {t("answerEditor.checklistTitle")}
            </h2>
            <ol className="answer-checklist">
              {CHECKLIST.map(([titleKey, bodyKey], index) => (
                <li key={titleKey}>
                  <span aria-hidden="true" className="answer-checklist__mark">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{t(titleKey)}</strong>
                    <p>{t(bodyKey)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          {activeResume ? (
            <section aria-labelledby="answer-resume-title" className="answer-aside__section">
              <h2 className="answer-aside__title" id="answer-resume-title">
                {t("answerEditor.resumeTitle")}
              </h2>
              <Link className="answer-resume" to={routeConfig.resumeOverview.buildPath({ versionId: activeResume.id })}>
                <strong>{activeResume.resumeTitle}</strong>
                <span>{[activeResume.versionNumberLabel, t("answerEditor.resumeBody")].filter(Boolean).join(" · ")}</span>
              </Link>
            </section>
          ) : null}
          {question.body && question.body !== question.title ? (
            <section aria-labelledby="answer-about-title" className="answer-aside__section">
              <h2 className="answer-aside__title" id="answer-about-title">
                {t("answerEditor.aboutQuestion")}
              </h2>
              <p className="answer-aside__body">{question.body}</p>
            </section>
          ) : null}
          {referenceAnswer ? (
            <details className="answer-reference">
              <summary>{t("answerEditor.showReferenceAnswer")}</summary>
              <strong>{referenceAnswer.title}</strong>
              <p>{referenceAnswer.answerText}</p>
            </details>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
