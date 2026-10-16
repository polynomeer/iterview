import { useId, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { InterviewSessionListItemModel } from "../../entities/interview/model";
import { countDue } from "../../entities/review-queue/dueDates";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useInterviewSessionsQuery } from "../../features/interview/api/useInterviewSessionsQuery";
import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { getErrorDetails, optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { scoreTone } from "../../shared/lib/labels";
import { Button, ButtonLink, Callout, Card, PageHeader, Skeleton, TabLinks } from "../../shared/ui/primitives";
import "./interview.css";
import { INTERVIEW_MODES as MODES, interviewModeLabel, type InterviewMode as Mode } from "./modes";

type Basis = "resume_mock" | "review_mock";
type QuestionCount = "3" | "5";

/** A real radio input styled as a card: the title names it, the meta line describes it. */
function OptionCard({
  name,
  checked,
  disabled,
  title,
  meta,
  onSelect,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  title: string;
  meta?: ReactNode;
  onSelect: () => void;
}) {
  const id = useId();
  return (
    <label className={`interview-option${checked ? " interview-option--checked" : ""}${disabled ? " interview-option--disabled" : ""}`}>
      <input
        aria-describedby={meta ? `${id}-meta` : undefined}
        aria-labelledby={`${id}-title`}
        checked={checked}
        disabled={disabled}
        name={name}
        onChange={onSelect}
        type="radio"
      />
      <span className="interview-option__copy">
        <span className="interview-option__title" id={`${id}-title`}>
          {title}
        </span>
        {meta ? (
          <span className="interview-option__meta" id={`${id}-meta`}>
            {meta}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function Step({ index, legend, children }: { index: number; legend: string; children: ReactNode }) {
  return (
    <fieldset className="interview-step">
      <legend>
        <span aria-hidden="true" className="interview-step__index">
          {index}
        </span>
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function SessionRow({ session }: { session: InterviewSessionListItemModel }) {
  const { t } = useLocale();
  const basis = session.sessionType === "review_mock" ? t("mockInterview.reviewQuestions") : t("mockInterview.resumeBased");
  const done = session.status === "completed";
  const meta = [session.startedAtLabel, t("mockInterview.answeredProgress", { questionCount: session.questionCount, answeredCount: session.answeredCount })]
    .filter(Boolean)
    .join(" · ");
  return (
    <li>
      <Link
        className="interview-record"
        to={done ? routeConfig.interviewSessionResult.buildPath({ sessionId: session.id }) : routeConfig.interviewSession.buildPath({ sessionId: session.id })}
      >
        {done && session.averageScore !== null ? (
          <span className={`interview-record__score ui-tone-text--${scoreTone(session.averageScore)}`}>{session.averageScoreLabel}</span>
        ) : (
          <span className="interview-record__tag interview-record__tag--progress">{t("mockInterview.inProgress")}</span>
        )}
        <span className="interview-record__copy">
          <span className="interview-record__title">{`${t("mockInterview.mockInterview")} · ${basis} · ${interviewModeLabel(session.interviewMode, session.interviewModeLabel, t)}`}</span>
          <span className="interview-record__meta">{meta}</span>
        </span>
        <span className="interview-record__action">{done ? t("mockInterview.result") : t("mockInterview.resume")}</span>
      </Link>
    </li>
  );
}

function PracticalRow({ id, title, dateLabel, questionCount }: { id: string; title: string; dateLabel: string | null; questionCount: number }) {
  const { t } = useLocale();
  const meta = [dateLabel, t("mockInterview.practicalQuestionCount", { count: questionCount })].filter(Boolean).join(" · ");
  return (
    <li>
      <Link className="interview-record" to={routeConfig.practicalInterviewDetail.buildPath({ recordId: id })}>
        <span className="interview-record__tag">{t("mockInterview.practicalTag")}</span>
        <span className="interview-record__copy">
          <span className="interview-record__title">{title}</span>
          <span className="interview-record__meta">{meta}</span>
        </span>
      </Link>
    </li>
  );
}

function PastInterviews() {
  const { t } = useLocale();
  const sessionsQuery = useInterviewSessionsQuery();
  const recordsQuery = useInterviewRecordListQuery();
  const sessions = (sessionsQuery.data ?? []).slice(0, 5);
  const records = (recordsQuery.data ?? []).slice(0, 3);

  let body: ReactNode;
  if (sessionsQuery.isLoading || recordsQuery.isLoading) {
    body = <Skeleton height="3rem" />;
  } else if (sessionsQuery.isError) {
    body = (
      <p className="interview-hint">
        {t("mockInterview.weCouldntLoadPastSessions")}
        <Button onClick={() => void sessionsQuery.refetch()} size="sm" variant="ghost">
          {t("common.tryAgain")}
        </Button>
      </p>
    );
  } else if (sessions.length === 0 && records.length === 0 && !recordsQuery.isError) {
    body = <p className="interview-hint">{t("mockInterview.noInterviewsYet")}</p>;
  } else {
    body = (
      <>
        <ul className="interview-records">
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
          {records.map((record) => (
            <PracticalRow dateLabel={record.interviewDateLabel ?? record.createdAtLabel} id={record.id} key={record.id} questionCount={record.questionCount} title={record.title} />
          ))}
        </ul>
        {recordsQuery.isError ? (
          <p className="interview-hint">
            {t("mockInterview.weCouldntLoadPracticalRecords")}
            <Button onClick={() => void recordsQuery.refetch()} size="sm" variant="ghost">
              {t("common.tryAgain")}
            </Button>
          </p>
        ) : null}
      </>
    );
  }

  return (
    <Card aria-labelledby="interview-history-title" className="interview-history">
      <h2 className="interview-card-title" id="interview-history-title">
        {t("mockInterview.pastInterviews")}
      </h2>
      {body}
    </Card>
  );
}

/** 면접 · 모의면접: one setup card with three choices (기준 · 분량 · 첫 질문 수), then past interviews. */
export function InterviewPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { active, isLoading: resumeLoading } = useActiveResumeVersion();
  const reviewQueueQuery = useReviewQueueQuery();
  const createMutation = useCreateInterviewSessionMutation();
  const [basis, setBasis] = useState<Basis>("resume_mock");
  const [mode, setMode] = useState<Mode>("mock_30");
  const [questionCount, setQuestionCount] = useState<QuestionCount>("3");
  const reviewCount = countDue(reviewQueueQuery.data?.items ?? []);
  const effectiveBasis: Basis = basis === "resume_mock" && !active && reviewCount > 0 ? "review_mock" : basis;
  const canStart = effectiveBasis === "resume_mock" ? Boolean(active) : reviewCount > 0;
  const modeOptions = effectiveBasis === "resume_mock" ? MODES : MODES.filter((candidate) => candidate.id !== "full_coverage");
  const effectiveMode = modeOptions.some((candidate) => candidate.id === mode) ? mode : "mock_30";
  const selectedMode = MODES.find((candidate) => candidate.id === effectiveMode) ?? MODES[1];
  const startError = optionalErrorMessage(createMutation.error, t("mockInterview.weCouldntStartTheInterview"));
  const countOptions: Array<{ id: QuestionCount; label: string }> = [
    { id: "3", label: t("mockInterview.threeQuestions") },
    { id: "5", label: t("mockInterview.fiveQuestions") },
  ];
  const basisSummary =
    effectiveBasis === "resume_mock"
      ? active
        ? `${active.resumeTitle} · ${active.versionNumberLabel}`
        : t("mockInterview.myResume")
      : t("mockInterview.questionsToReview");
  const countLabel = countOptions.find((option) => option.id === questionCount)?.label ?? questionCount;

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
      <div className="interview-header">
        <PageHeader title={t("mockInterview.interviewTitle")} />
        <TabLinks
          items={[
            { to: routeConfig.interview.buildPath(), label: t("mockInterview.tabMock"), end: true },
            { to: routeConfig.practicalInterviews.buildPath(), label: t("mockInterview.tabPractical") },
          ]}
          label={t("mockInterview.interviewViews")}
        />
      </div>

      <div className="interview-layout">
        <Card aria-labelledby="interview-setup-title" className="interview-setup">
          <div className="interview-setup__heading">
            <span className="interview-eyebrow">{t("mockInterview.newMockInterview")}</span>
            <h2 className="interview-setup__title" id="interview-setup-title">
              {t("mockInterview.setupHeadline")}
            </h2>
          </div>

          <Step index={1} legend={t("mockInterview.stepSourceShort")}>
            {resumeLoading ? (
              <Skeleton height="4rem" />
            ) : (
              <div className="interview-options">
                <OptionCard
                  checked={effectiveBasis === "resume_mock"}
                  disabled={!active}
                  meta={active ? `${active.resumeTitle} · ${active.versionNumberLabel}` : t("mockInterview.noActiveResume")}
                  name="interview-basis"
                  onSelect={() => setBasis("resume_mock")}
                  title={t("mockInterview.myResume")}
                />
                <OptionCard
                  checked={effectiveBasis === "review_mock"}
                  disabled={reviewCount === 0}
                  meta={reviewCount > 0 ? t("mockInterview.questionsDueCount", { reviewCount }) : t("mockInterview.nothingDueForReview")}
                  name="interview-basis"
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
          </Step>

          <Step index={2} legend={t("mockInterview.stepModeShort")}>
            <div className="interview-options">
              {modeOptions.map((candidate) => (
                <OptionCard
                  checked={candidate.id === effectiveMode}
                  key={candidate.id}
                  meta={t(candidate.description)}
                  name="interview-mode"
                  onSelect={() => setMode(candidate.id)}
                  title={t(candidate.label)}
                />
              ))}
            </div>
          </Step>

          <Step index={3} legend={t("mockInterview.stepCountShort")}>
            <div className="interview-options">
              {countOptions.map((option) => (
                <OptionCard
                  checked={option.id === questionCount}
                  key={option.id}
                  name="interview-count"
                  onSelect={() => setQuestionCount(option.id)}
                  title={option.label}
                />
              ))}
            </div>
          </Step>

          {startError ? (
            <Callout tone="danger">
              {startError}
              {getErrorDetails(createMutation.error).map((detail) => (
                <div key={detail}>{detail}</div>
              ))}
            </Callout>
          ) : null}
          <div className="interview-setup__footer">
            <p className="interview-setup__summary">
              {t("mockInterview.setupSummary", { basis: basisSummary, mode: t(selectedMode.label), count: countLabel })}
            </p>
            <Button disabled={!canStart} loading={createMutation.isPending} onClick={() => void start()} size="lg" variant="primary">
              {t("mockInterview.startInterview")}
            </Button>
          </div>
        </Card>

        <aside aria-label={t("mockInterview.pastSessionsAndRealInterviews")} className="interview-aside">
          <PastInterviews />
          <section aria-labelledby="interview-practical-title" className="interview-invite">
            <span className="interview-invite__eyebrow" id="interview-practical-title">
              {t("mockInterview.backFromARealInterview")}
            </span>
            <p className="interview-invite__body">{t("mockInterview.uploadOrRecordItAnd")}</p>
            <Link className="interview-invite__link" to={routeConfig.practicalInterviewUpload.buildPath()}>
              {t("mockInterview.recordAReview")}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
