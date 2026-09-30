import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getActiveResumeVersionId } from "../../entities/resume/model";
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
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  ErrorState,
  Icon,
  PageSkeleton,
} from "../../shared/ui/primitives";
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

/** The last evaluation's advice, shown right above the editor when retrying. */
function LastFeedback({ answerAttemptId }: { answerAttemptId: string }) {
  const { t } = useLocale();
  const resultQuery = useResultAnalysisQuery(answerAttemptId);
  const advice = resultQuery.data?.recommendedNextStep ?? resultQuery.data?.weaknessSummary ?? resultQuery.data?.improvementPoints[0] ?? null;

  if (!advice) {
    return null;
  }

  return (
    <Callout title={t("answerEditor.lastFeedback")} tone="warning">
      {advice}
    </Callout>
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
  const editorId = useId();
  const questionQuery = useQuestionDetailQuery(questionId);
  const historyQuery = useQuestionAnswerHistoryQuery(questionId);
  const resumeListQuery = useResumeListQuery();
  const submitMutation = useSubmitAnswerMutation();
  const { draft, setDraft, clearDraft, hasDraft } = useAnswerDraft(questionId);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const elapsed = useElapsedSeconds();
  const trimmedDraft = draft.trim();
  const activeResumeVersionId = getActiveResumeVersionId(resumeListQuery.data);
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
      <ButtonLink icon="close" size="sm" to={questionPath} variant="ghost">
        {t("answerEditor.exit")}
      </ButtonLink>
      <nav aria-label={t("answerEditor.youAreHere")} className="answer-focus-bar__path">
        <Link to={routeConfig.practice.buildPath()}>{t("answerEditor.questions")}</Link>
        {question ? (
          <>
            <Icon name="chevronRight" size={14} />
            <span>{question.category}</span>
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
      <div className="answer-page">
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
      <div className="answer-page">
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

  return (
    <div className="answer-page">
      {focusBar}
      <main className="answer-layout">
        <section aria-labelledby="answer-question" className="answer-main">
          <div className="answer-main__badges">
            {latestAttempt?.totalScore !== null && latestAttempt?.totalScore !== undefined ? (
              <Badge dot tone={scoreTone(latestAttempt.totalScore)}>
                {t("answerEditor.lastScore", { score: latestAttempt.totalScore })}
              </Badge>
            ) : null}
            {historyQuery.data && historyQuery.data.items.length > 0 ? (
              <Badge>{t("answerEditor.attemptNumber", { count: historyQuery.data.items.length + 1 })}</Badge>
            ) : null}
            {difficulty ? <Badge>{difficulty}</Badge> : null}
          </div>
          <h1 className="answer-main__question" id="answer-question">
            {question.title}
          </h1>
          {latestAttempt ? <LastFeedback answerAttemptId={latestAttempt.answerAttemptId} /> : null}
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
            <div className="answer-editor__footer">
              <span id={`${editorId}-hint`}>
                {t("answerEditor.draftStats", { chars: trimmedDraft.length, sentences: countSentences(trimmedDraft) })}
                <span className="answer-editor__shortcut">{t("answerEditor.submitShortcut")}</span>
              </span>
              <Button loading={submitMutation.isPending} onClick={() => void handleSubmit()} size="lg" variant="primary">
                {t("answerEditor.submit")}
              </Button>
            </div>
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
          <Card padded>
            <h2 className="answer-aside__title">{t("answerEditor.checklistTitle")}</h2>
            <ol className="answer-checklist">
              {CHECKLIST.map(([titleKey, bodyKey], index) => (
                <li key={titleKey}>
                  <span aria-hidden="true" className="answer-checklist__number">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{t(titleKey)}</strong>
                    <p>{t(bodyKey)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          {question.body && question.body !== question.title ? (
            <Card padded>
              <h2 className="answer-aside__title">{t("answerEditor.aboutQuestion")}</h2>
              <p className="answer-aside__body">{question.body}</p>
            </Card>
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
