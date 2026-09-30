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
import { useLocale } from "../../shared/i18n";
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

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

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
  const copy = useCopy();
  const resultQuery = useResultAnalysisQuery(answerAttemptId);
  const advice = resultQuery.data?.recommendedNextStep ?? resultQuery.data?.weaknessSummary ?? resultQuery.data?.improvementPoints[0] ?? null;

  if (!advice) {
    return null;
  }

  return (
    <Callout title={copy("지난 피드백", "Last feedback")} tone="warning">
      {advice}
    </Callout>
  );
}

const CHECKLIST: Array<[string, string, string, string]> = [
  ["주장", "첫 문장에서 결론부터 말하세요.", "Claim", "Lead with your conclusion."],
  ["근거", "수치, 제약, 실제 프로젝트 사례를 하나 이상 붙이세요.", "Evidence", "Add at least one number, constraint, or real project example."],
  ["꼬리질문 대비", "왜 그 방법을 골랐는지, 다른 선택지와 무엇이 다른지 적으세요.", "Follow-up readiness", "Say why you chose this approach over the alternatives."],
];

export function AnswerEditorPage() {
  const navigate = useNavigate();
  const { questionId = "" } = useParams<{ questionId: string }>();
  const { locale, t } = useLocale();
  const copy = useCopy();
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
        {copy("나가기", "Exit")}
      </ButtonLink>
      <nav aria-label={copy("현재 위치", "You are here")} className="answer-focus-bar__path">
        <Link to={routeConfig.practice.buildPath()}>{copy("질문", "Questions")}</Link>
        {question ? (
          <>
            <Icon name="chevronRight" size={14} />
            <span>{question.category}</span>
          </>
        ) : null}
      </nav>
      <span aria-live="polite" className="answer-focus-bar__saved">
        {hasDraft ? copy("이 브라우저에 자동 저장됨", "Saved in this browser") : ""}
      </span>
      <span className="answer-focus-bar__timer">
        <span className="ui-visually-hidden">{copy("경과 시간", "Elapsed time")}</span>
        {formatElapsed(elapsed)}
      </span>
    </header>
  );

  if (questionQuery.isLoading) {
    return (
      <div className="answer-page">
        {focusBar}
        <main className="answer-layout">
          <PageSkeleton label={copy("질문을 불러오는 중", "Loading the question")} />
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
                {copy(`지난 점수 ${latestAttempt.totalScore}`, `Last score ${latestAttempt.totalScore}`)}
              </Badge>
            ) : null}
            {historyQuery.data && historyQuery.data.items.length > 0 ? (
              <Badge>{copy(`${historyQuery.data.items.length + 1}번째 시도`, `Attempt ${historyQuery.data.items.length + 1}`)}</Badge>
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
              {copy("답변 입력", "Your answer")}
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
                {copy(`${trimmedDraft.length}자 · ${countSentences(trimmedDraft)}문장`, `${trimmedDraft.length} chars · ${countSentences(trimmedDraft)} sentences`)}
                <span className="answer-editor__shortcut">{copy(" · ⌘/Ctrl+Enter로 제출", " · ⌘/Ctrl+Enter to submit")}</span>
              </span>
              <Button loading={submitMutation.isPending} onClick={() => void handleSubmit()} size="lg" variant="primary">
                {copy("제출하고 평가받기", "Submit for evaluation")}
              </Button>
            </div>
          </div>
          {validationMessage ? (
            <p className="answer-editor__error" id={`${editorId}-error`} role="alert">
              {validationMessage}
            </p>
          ) : null}
          {submitError ? (
            <Callout title={copy("제출하지 못했어요", "Submission failed")} tone="danger">
              {submitError}
              {getErrorDetails(submitMutation.error).map((detail) => (
                <div key={detail}>{detail}</div>
              ))}
            </Callout>
          ) : null}
        </section>

        <aside aria-label={copy("답변 가이드", "Answer guide")} className="answer-aside">
          <Card padded>
            <h2 className="answer-aside__title">{copy("좋은 답변 체크", "What a strong answer has")}</h2>
            <ol className="answer-checklist">
              {CHECKLIST.map(([koTitle, koBody, enTitle, enBody], index) => (
                <li key={koTitle}>
                  <span aria-hidden="true" className="answer-checklist__number">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{copy(koTitle, enTitle)}</strong>
                    <p>{copy(koBody, enBody)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          {question.body && question.body !== question.title ? (
            <Card padded>
              <h2 className="answer-aside__title">{copy("질문 설명", "About this question")}</h2>
              <p className="answer-aside__body">{question.body}</p>
            </Card>
          ) : null}
          {referenceAnswer ? (
            <details className="answer-reference">
              <summary>{copy("모범 답안 보기", "Show a reference answer")}</summary>
              <strong>{referenceAnswer.title}</strong>
              <p>{referenceAnswer.answerText}</p>
            </details>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
