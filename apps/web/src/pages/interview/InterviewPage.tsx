import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InterviewSessionListItemModel } from "../../entities/interview/model";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useInterviewSessionsQuery } from "../../features/interview/api/useInterviewSessionsQuery";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { getErrorDetails, optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import type { MessageKey } from "../../shared/i18n/messages";
import { scoreTone } from "../../shared/lib/labels";
import type { CreateInterviewSessionRequestDto } from "../../shared/types/interview";
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

type Mode = NonNullable<CreateInterviewSessionRequestDto["interviewMode"]>;
type Basis = "resume_mock" | "review_mock";

const MODES: Array<{ id: Mode; label: MessageKey; description: MessageKey }> = [
  { id: "quick_screen", label: "interview.modeQuickScreen", description: "interview.modeQuickScreenDescription" },
  { id: "mock_30", label: "interview.modeMock30", description: "interview.modeMock30Description" },
  { id: "mock_60", label: "interview.modeMock60", description: "interview.modeMock60Description" },
  { id: "free_interview", label: "interview.modeFreeInterview", description: "interview.modeFreeInterviewDescription" },
  { id: "full_coverage", label: "interview.modeFullCoverage", description: "interview.modeFullCoverageDescription" },
];

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

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
  const copy = useCopy();
  const mode = MODES.find((candidate) => candidate.id === session.interviewMode);
  const basis = session.sessionType === "review_mock" ? copy("복습 질문", "Review questions") : copy("이력서 기반", "Resume-based");
  const done = session.status === "completed";
  return (
    <ListRow
      meta={[session.startedAtLabel, copy(`${session.questionCount}문항 중 ${session.answeredCount}개 답변`, `${session.answeredCount} of ${session.questionCount} answered`)].filter(Boolean).join(" · ")}
      title={`${basis} · ${mode ? t(mode.label) : session.interviewModeLabel}`}
      trailing={
        <span className="interview-row-actions">
          {done && session.averageScore !== null ? (
            <strong className={`interview-score ui-tone-text--${scoreTone(session.averageScore)}`}>{session.averageScoreLabel}</strong>
          ) : null}
          {!done ? <Badge tone="accent">{copy("진행 중", "In progress")}</Badge> : null}
          <ButtonLink
            size="sm"
            to={done ? routeConfig.interviewSessionResult.buildPath({ sessionId: session.id }) : routeConfig.interviewSession.buildPath({ sessionId: session.id })}
            variant="ghost"
          >
            {done ? copy("결과", "Result") : copy("이어서", "Resume")}
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
  const copy = useCopy();
  const { active, isLoading: resumeLoading } = useActiveResumeVersion();
  const reviewQueueQuery = useReviewQueueQuery();
  const sessionsQuery = useInterviewSessionsQuery();
  const createMutation = useCreateInterviewSessionMutation();
  const [basis, setBasis] = useState<Basis>("resume_mock");
  const [mode, setMode] = useState<Mode>("mock_30");
  const [questionCount, setQuestionCount] = useState<"3" | "5">("3");
  const reviewCount = reviewQueueQuery.data?.items.length ?? 0;
  const effectiveBasis: Basis = basis === "resume_mock" && !active && reviewCount > 0 ? "review_mock" : basis;
  const canStart = effectiveBasis === "resume_mock" ? Boolean(active) : reviewCount > 0;
  const modeOptions = effectiveBasis === "resume_mock" ? MODES : MODES.filter((candidate) => candidate.id !== "full_coverage");
  const effectiveMode = modeOptions.some((candidate) => candidate.id === mode) ? mode : "mock_30";
  const selectedMode = MODES.find((candidate) => candidate.id === effectiveMode) ?? MODES[1];
  const startError = optionalErrorMessage(createMutation.error, copy("면접을 시작하지 못했어요. 다시 시도하세요.", "We couldn't start the interview. Try again."));
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
        description={copy("실제 면접처럼 이어지는 질문에 답하고, 답변마다 꼬리질문을 받아요.", "Answer questions back to back like a real interview, with follow-ups on every answer.")}
        title={copy("모의면접", "Mock interview")}
      />
      <div className="interview-layout">
        <Card aria-labelledby="interview-setup-title">
          <CardHeader title={<span id="interview-setup-title">{copy("새 모의면접", "New mock interview")}</span>} titleAs="h2" />
          <CardBody className="interview-setup">
            <fieldset className="interview-step">
              <legend>{copy("1. 무엇을 기준으로 질문할까요?", "1. What should the questions come from?")}</legend>
              {resumeLoading ? (
                <Skeleton height="4rem" />
              ) : (
                <div className="interview-basis-grid">
                  <BasisOption
                    checked={effectiveBasis === "resume_mock"}
                    disabled={!active}
                    meta={active ? `${active.resumeTitle} · ${active.versionNumberLabel}` : copy("사용 중인 이력서가 없어요", "No active resume")}
                    onSelect={() => setBasis("resume_mock")}
                    title={copy("내 이력서", "My resume")}
                  />
                  <BasisOption
                    checked={effectiveBasis === "review_mock"}
                    disabled={reviewCount === 0}
                    meta={reviewCount > 0 ? copy(`복습할 질문 ${reviewCount}개`, `${reviewCount} questions due`) : copy("복습할 질문이 없어요", "Nothing due for review")}
                    onSelect={() => setBasis("review_mock")}
                    title={copy("복습할 질문", "Questions to review")}
                  />
                </div>
              )}
              {!resumeLoading && !active ? (
                <p className="interview-hint">
                  {copy("이력서 기반 면접은 이력서를 올리고 사용할 버전을 고르면 열려요. ", "Resume-based interviews unlock once you upload a resume and pick a version. ")}
                  <ButtonLink size="sm" to={routeConfig.resume.buildPath()} variant="ghost">
                    {copy("이력서 올리기", "Upload a resume")}
                  </ButtonLink>
                </p>
              ) : null}
            </fieldset>

            <fieldset className="interview-step">
              <legend>{copy("2. 어떤 면접으로 할까요?", "2. What kind of interview?")}</legend>
              <Segmented
                items={modeOptions.map((candidate) => ({ id: candidate.id, label: t(candidate.label) }))}
                label={copy("면접 방식", "Interview mode")}
                onChange={setMode}
                value={effectiveMode}
              />
              <p className="interview-hint">{t(selectedMode.description)}</p>
            </fieldset>

            <fieldset className="interview-step">
              <legend>{copy("3. 처음에 몇 문항을 받을까요?", "3. How many opening questions?")}</legend>
              <Segmented
                items={[
                  { id: "3", label: copy("3문항", "3 questions") },
                  { id: "5", label: copy("5문항", "5 questions") },
                ]}
                label={copy("첫 질문 수", "Opening questions")}
                onChange={setQuestionCount}
                value={questionCount}
              />
              <p className="interview-hint">{copy("답변에 따라 꼬리질문이 이어서 붙어요.", "Follow-ups are added based on your answers.")}</p>
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
                {copy("면접 시작", "Start interview")}
              </Button>
            </div>
          </CardBody>
        </Card>

        <aside aria-label={copy("지난 면접과 실전 복기", "Past sessions and real interviews")} className="interview-aside">
          <Card aria-labelledby="interview-history-title">
            <CardHeader title={<span id="interview-history-title">{copy("지난 모의면접", "Past mock interviews")}</span>} titleAs="h2" />
            {sessionsQuery.isLoading ? (
              <CardBody>
                <Skeleton height="3rem" />
              </CardBody>
            ) : sessionsQuery.isError ? (
              <CardBody>
                <p className="interview-hint">
                  {copy("지난 면접을 불러오지 못했어요. ", "We couldn't load past sessions. ")}
                  <Button onClick={() => void sessionsQuery.refetch()} size="sm" variant="ghost">
                    {t("common.tryAgain")}
                  </Button>
                </p>
              </CardBody>
            ) : sessions.length === 0 ? (
              <CardBody>
                <p className="interview-hint">{copy("아직 본 모의면접이 없어요.", "No mock interviews yet.")}</p>
              </CardBody>
            ) : (
              sessions.slice(0, 6).map((session) => <SessionRow key={session.id} session={session} />)
            )}
          </Card>
          <Card padded>
            <h2 className="interview-card-title">{copy("실전 면접을 다녀왔나요?", "Back from a real interview?")}</h2>
            <p className="interview-hint">
              {copy("녹음을 올리거나 바로 녹음하면 받은 질문을 뽑아 복습 목록에 넣어요.", "Upload or record it and we pull out the questions and add them to your review list.")}
            </p>
            <ButtonLink fullWidth icon="plus" to={routeConfig.practicalInterviewUpload.buildPath()}>
              {copy("면접 기록 추가", "Add an interview")}
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </div>
  );
}
