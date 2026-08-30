import { Link } from "react-router-dom";
import type { InterviewSessionQuestionModel } from "../../entities/interview/model";
import { useLocale } from "../../shared/i18n";
import { routeConfig } from "../../shared/config/routes";
import { InterviewResumeEvidenceBlock } from "./InterviewResumeEvidenceBlock";

type InterviewQuestionTimelineProps = {
  items: InterviewSessionQuestionModel[];
  currentQuestionId: string | null;
};

export function InterviewQuestionTimeline({
  items,
  currentQuestionId,
}: InterviewQuestionTimelineProps) {
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const answeredCount = items.filter((item) => item.status.toLowerCase() === "answered").length;
  const skippedCount = items.filter((item) => item.status.toLowerCase() === "skipped").length;
  const currentIndex = currentQuestionId ? items.findIndex((item) => item.id === currentQuestionId) : -1;
  const maxDepth = items.reduce((max, item) => Math.max(max, item.depth), 0);

  return (
    <section className="page-card interview-timeline-workspace">
      <div className="interview-timeline-workspace__header">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">{t("interview.questionTimelineEyebrow")}</p>
            <h2 className="page-card__title">{t("interview.questionTimelineTitle")}</h2>
          </div>
          <span className="section-heading__count">{items.length}</span>
        </div>
        <div
          className="interview-timeline-workspace__summary-row"
          role="list"
          aria-label={isKorean ? "세션 흐름 신호" : "Session flow signals"}
        >
          <span className="interview-timeline-workspace__summary-item" role="listitem">
            {currentIndex >= 0
              ? isKorean
                ? `현재 단계 #${currentIndex + 1}`
                : `Current step #${currentIndex + 1}`
              : isKorean
                ? "검토"
                : "Review"}
          </span>
          <span className="interview-timeline-workspace__summary-item" role="listitem">
            {isKorean ? `답변 완료 ${answeredCount}` : `Answered ${answeredCount}`}
          </span>
          <span className="interview-timeline-workspace__summary-item" role="listitem">
            {isKorean ? `건너뜀 ${skippedCount}` : `Skipped ${skippedCount}`}
          </span>
          <span className="interview-timeline-workspace__summary-item interview-timeline-workspace__summary-item--accent" role="listitem">
            {isKorean ? `최대 깊이 ${maxDepth + 1}` : `Max depth ${maxDepth + 1}`}
          </span>
        </div>
      </div>
      <p className="page-card__body interview-timeline-workspace__intro">
        {isKorean
          ? "질문 순서, 근거 앵커, 생성된 꼬리질문을 분리된 질문 문구가 아니라 하나의 연속된 방어 경로로 검토하세요."
          : "Review the branch order, evidence anchors, and generated follow-ups as one continuous defense path rather than isolated prompts."}
      </p>
      <div
        className="interview-timeline-workspace__principles"
        role="list"
        aria-label={isKorean ? "세션 흐름 원칙" : "Session flow principles"}
      >
        <span role="listitem">
          {isKorean
            ? "가지를 개별 질문 문구가 아니라 하나의 방어 경로로 읽으세요."
            : "Read the branch as one defense path, not as separate prompts."}
        </span>
        <span role="listitem">
          {isKorean
            ? "노드가 가지 판단을 실제로 바꿀 때만 재검토와 결과 링크를 사용하세요."
            : "Use revisit and result links only when a node still changes the branch decision."}
        </span>
      </div>
      <div className="stack-list interview-timeline-workspace__stack">
        {items.map((item) => {
          const canOpenQuestion = Boolean(item.questionId);
          const isAiFollowUp = item.sourceType === "ai_follow_up";
          const normalizedStatus = item.status.toLowerCase();
          const toneClass =
            currentQuestionId === item.id
              ? "interview-timeline-card--current"
              : normalizedStatus === "answered"
                ? "interview-timeline-card--answered"
                : normalizedStatus === "skipped"
                  ? "interview-timeline-card--skipped"
                  : "interview-timeline-card--queued";

          return (
            <article
              className={`list-item-card interview-timeline-card ${toneClass} ${
                currentQuestionId === item.id ? "list-item-card--selected" : ""
              }`}
              id={`session-question-card-${item.id}`}
              key={item.id}
              style={{ marginLeft: `${item.depth * 18}px` }}
            >
              <div className="interview-timeline-card__rail" aria-hidden="true">
                <span className="interview-timeline-card__rail-line" />
                <span className="interview-timeline-card__rail-node">{item.depth + 1}</span>
              </div>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>#{item.orderIndex + 1}</span>
                  <span>{isKorean ? `깊이 ${item.depth + 1}` : `Depth ${item.depth + 1}`}</span>
                  <span>{item.difficultyLabel}</span>
                  <span>{item.status}</span>
                  {item.contentLocale ? (
                    <span>
                      {item.contentLocale === "ko"
                        ? t("common.generatedInKorean")
                        : t("common.generatedInEnglish")}
                    </span>
                  ) : null}
                  {isAiFollowUp ? (
                    <span className="question-status-badge question-status-badge--accent">
                      {isKorean ? "AI 꼬리질문" : "AI follow-up"}
                    </span>
                  ) : item.isFollowUp ? (
                    <span className="question-status-badge question-status-badge--neutral">
                      {isKorean ? "꼬리질문" : "Follow-up"}
                    </span>
                  ) : (
                    <span className="question-status-badge question-status-badge--neutral">{item.sourceLabel}</span>
                  )}
                </div>
                <h3 className="list-item-card__title">{item.title}</h3>
                {item.categoryName ? <p className="resume-section__helper">{item.categoryName}</p> : null}
                {item.bodyText ? <p className="list-item-card__body">{item.bodyText}</p> : null}
                {item.revisitLabel ? (
                  <p className="resume-section__helper interview-question-revisit-note">{item.revisitLabel}</p>
                ) : null}
                {item.focusSkillNames.length > 0 || item.tags.length > 0 ? (
                  <div className="chip-list">
                    {item.focusSkillNames.map((skill) => (
                      <span className="detail-chip detail-chip--accent" key={skill}>
                        {skill}
                      </span>
                    ))}
                    {item.tags.map((tag) => (
                      <span className="detail-chip" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.resumeContextSummary ? (
                  <p className="resume-section__helper">{item.resumeContextSummary}</p>
                ) : null}
                <InterviewResumeEvidenceBlock items={item.resumeEvidence} />
                <details className="interview-timeline-card__details">
                  <summary>{t("interview.generationDetails")}</summary>
                  <div className="stack-list">
                    <p className="page-card__body">
                      {t("interview.generationStatus")}: {item.generationStatusLabel}
                    </p>
                    {item.generationRationale ? (
                      <p className="page-card__body">{item.generationRationale}</p>
                    ) : null}
                    {item.llmModel || item.llmPromptVersion ? (
                      <p className="resume-section__helper">
                        {[item.llmModel, item.llmPromptVersion].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </details>
              </div>
              <div className="list-item-card__actions">
                {canOpenQuestion ? (
                  <Link
                    className="secondary-button"
                    to={routeConfig.questionDetail.buildPath({ questionId: item.questionId ?? "" })}
                  >
                    {isKorean ? "질문 카탈로그 열기" : "Open catalog question"}
                  </Link>
                ) : null}
                {item.answerAttemptId ? (
                  <Link
                    className="secondary-button"
                    to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: item.answerAttemptId })}
                  >
                    {isKorean ? "답변 결과 열기" : "Open answer result"}
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
