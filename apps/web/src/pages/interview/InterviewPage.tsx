import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InterviewSessionListItemModel } from "../../entities/interview/model";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useInterviewSessionsQuery } from "../../features/interview/api/useInterviewSessionsQuery";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { countDue } from "../../entities/review-queue/dueDates";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { getErrorDetails, optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { scoreTone } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardBody,
  CardHeader,
  ListRow,
  PageHeader,
  Segmented,
  Skeleton,
} from "../../shared/ui/primitives";
import "./interview.css";
import { INTERVIEW_MODES as MODES, interviewModeLabel, type InterviewMode as Mode } from "./modes";

type Basis = "resume_mock" | "review_mock";

function BasisOption({ checked, disabled, title, meta, onSelect }: { checked: boolean; disabled?: boolean; title: string; meta: string; onSelect: () => void }) {
  return (
    <label className={`interview-basis${checked ? " interview-basis--checked" : ""}${disabled ? " interview-basis--disabled" : ""}`}>
      <input checked={checked} disabled={disabled} name="interview-basis" onChange={onSelect} type="radio" />
      <span className="interview-basis__copy">
        <strong>{title}</strong>
        <span>{meta}</span>
      </span>
    </label>
  );
}

function SessionRow({ session }: { session: InterviewSessionListItemModel }) {
  const { t } = useLocale();
  const basis = session.sessionType === "review_mock" ? t("mockInterview.reviewQuestions") : t("mockInterview.resumeBased");
  const done = session.status === "completed";
  return (
    <ListRow
      meta={[session.startedAtLabel, t("mockInterview.answeredProgress", { questionCount: session.questionCount, answeredCount: session.answeredCount })].filter(Boolean).join(" · ")}
      title={`${basis} · ${interviewModeLabel(session.interviewMode, session.interviewModeLabel, t)}`}
      trailing={
        <span className="interview-row-actions">
          {done && session.averageScore !== null ? (
            <strong className={`interview-score ui-tone-text--${scoreTone(session.averageScore)}`}>{session.averageScoreLabel}</strong>
          ) : null}
          {!done ? <Badge tone="accent">{t("mockInterview.inProgress")}</Badge> : null}
          <ButtonLink
            size="sm"
            to={done ? routeConfig.interviewSessionResult.buildPath({ sessionId: session.id }) : routeConfig.interviewSession.buildPath({ sessionId: session.id })}
            variant="ghost"
          >
            {done ? t("mockInterview.result") : t("mockInterview.resume")}
          </ButtonLink>
        </span>
      }
    />
  );
}

/** 모의면접: three setup questions (기준 · 분량 · 첫 질문 수), then recent sessions. */
export function InterviewPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { active, isLoading: resumeLoading } = useActiveResumeVersion();
  const reviewQueueQuery = useReviewQueueQuery();
  const sessionsQuery = useInterviewSessionsQuery();
  const createMutation = useCreateInterviewSessionMutation();
  const [basis, setBasis] = useState<Basis>("resume_mock");
  const [mode, setMode] = useState<Mode>("mock_30");
  const [questionCount, setQuestionCount] = useState<"3" | "5">("3");
  const reviewCount = countDue(reviewQueueQuery.data?.items ?? []);
  const effectiveBasis: Basis = basis === "resume_mock" && !active && reviewCount > 0 ? "review_mock" : basis;
  const canStart = effectiveBasis === "resume_mock" ? Boolean(active) : reviewCount > 0;
  const modeOptions = effectiveBasis === "resume_mock" ? MODES : MODES.filter((candidate) => candidate.id !== "full_coverage");
  const effectiveMode = modeOptions.some((candidate) => candidate.id === mode) ? mode : "mock_30";
  const selectedMode = MODES.find((candidate) => candidate.id === effectiveMode) ?? MODES[1];
  const startError = optionalErrorMessage(createMutation.error, t("mockInterview.weCouldntStartTheInterview"));
  const sessions = sessionsQuery.data ?? [];

  async function start() {
    if (!canStart) {
      return;
    }
    try {
      const response = await createMutation.mutateAsync({
        sessionType: effectiveBasis,
        interviewMode: effectiveMode,
        questionCount: Number(questionCount),
        resumeVersionId: effectiveBasis === "resume_mock" ? active?.id ?? null : null,
      });
      if (response.id !== null && response.id !== undefined) {
        navigate(routeConfig.interviewSession.buildPath({ sessionId: String(response.id) }));
      }
    } catch {
      // Rendered through `startError`.
    }
  }

  return (
    <div className="ui-page">
      <PageHeader
        description={t("mockInterview.answerQuestionsBackToBack")}
        title={t("mockInterview.mockInterview")}
      />
      <div className="interview-layout">
        <Card aria-labelledby="interview-setup-title">
          <CardHeader title={<span id="interview-setup-title">{t("mockInterview.newMockInterview")}</span>} titleAs="h2" />
          <CardBody className="interview-setup">
            <fieldset className="interview-step">
              <legend>{t("mockInterview.stepSource")}</legend>
              {resumeLoading ? (
                <Skeleton height="4rem" />
              ) : (
                <div className="interview-basis-grid">
                  <BasisOption
                    checked={effectiveBasis === "resume_mock"}
                    disabled={!active}
                    meta={active ? `${active.resumeTitle} · ${active.versionNumberLabel}` : t("mockInterview.noActiveResume")}
                    onSelect={() => setBasis("resume_mock")}
                    title={t("mockInterview.myResume")}
                  />
                  <BasisOption
                    checked={effectiveBasis === "review_mock"}
                    disabled={reviewCount === 0}
                    meta={reviewCount > 0 ? t("mockInterview.questionsDueCount", { reviewCount }) : t("mockInterview.nothingDueForReview")}
                    onSelect={() => setBasis("review_mock")}
                    title={t("mockInterview.questionsToReview")}
                  />
                </div>
              )}
              {!resumeLoading && !active ? (
                <p className="interview-hint">
                  {t("mockInterview.resumeBasedInterviewsUnlockOnce")}
                  <ButtonLink size="sm" to={routeConfig.resume.buildPath()} variant="ghost">
                    {t("mockInterview.uploadAResume")}
                  </ButtonLink>
                </p>
              ) : null}
            </fieldset>

            <fieldset className="interview-step">
              <legend>{t("mockInterview.stepMode")}</legend>
              <Segmented
                items={modeOptions.map((candidate) => ({ id: candidate.id, label: t(candidate.label) }))}
                label={t("mockInterview.interviewMode")}
                onChange={setMode}
                value={effectiveMode}
              />
              <p className="interview-hint">{t(selectedMode.description)}</p>
            </fieldset>

            <fieldset className="interview-step">
              <legend>{t("mockInterview.stepCount")}</legend>
              <Segmented
                items={[
                  { id: "3", label: t("mockInterview.threeQuestions") },
                  { id: "5", label: t("mockInterview.fiveQuestions") },
                ]}
                label={t("mockInterview.openingQuestions")}
                onChange={setQuestionCount}
                value={questionCount}
              />
              <p className="interview-hint">{t("mockInterview.followUpsAreAddedBased")}</p>
            </fieldset>

            {startError ? (
              <Callout tone="danger">
                {startError}
                {getErrorDetails(createMutation.error).map((detail) => (
                  <div key={detail}>{detail}</div>
                ))}
              </Callout>
            ) : null}
            <div>
              <Button disabled={!canStart} loading={createMutation.isPending} onClick={() => void start()} size="lg" variant="primary">
                {t("mockInterview.startInterview")}
              </Button>
            </div>
          </CardBody>
        </Card>

        <aside aria-label={t("mockInterview.pastSessionsAndRealInterviews")} className="interview-aside">
          <Card aria-labelledby="interview-history-title">
            <CardHeader title={<span id="interview-history-title">{t("mockInterview.pastMockInterviews")}</span>} titleAs="h2" />
            {sessionsQuery.isLoading ? (
              <CardBody>
                <Skeleton height="3rem" />
              </CardBody>
            ) : sessionsQuery.isError ? (
              <CardBody>
                <p className="interview-hint">
                  {t("mockInterview.weCouldntLoadPastSessions")}
                  <Button onClick={() => void sessionsQuery.refetch()} size="sm" variant="ghost">
                    {t("common.tryAgain")}
                  </Button>
                </p>
              </CardBody>
            ) : sessions.length === 0 ? (
              <CardBody>
                <p className="interview-hint">{t("mockInterview.noMockInterviewsYet")}</p>
              </CardBody>
            ) : (
              sessions.slice(0, 6).map((session) => <SessionRow key={session.id} session={session} />)
            )}
          </Card>
          <Card padded>
            <h2 className="interview-card-title">{t("mockInterview.backFromARealInterview")}</h2>
            <p className="interview-hint">
              {t("mockInterview.uploadOrRecordItAnd")}
            </p>
            <ButtonLink fullWidth icon="plus" to={routeConfig.practicalInterviewUpload.buildPath()}>
              {t("mockInterview.addAnInterview")}
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </div>
  );
}
