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
  const { t } = useLocale();

  return (
    <section className="page-card interview-timeline-workspace">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("interview.questionTimelineEyebrow")}</p>
          <h2 className="page-card__title">{t("interview.questionTimelineTitle")}</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <p className="page-card__body interview-timeline-workspace__intro">
        Review the branch order, evidence anchors, and generated follow-ups as one continuous defense path rather than isolated prompts.
      </p>
      <div className="stack-list interview-timeline-workspace__stack">
        {items.map((item) => {
          const canOpenQuestion = Boolean(item.questionId);
          const isAiFollowUp = item.sourceType === "ai_follow_up";

          return (
            <article
              className={`list-item-card interview-timeline-card ${currentQuestionId === item.id ? "list-item-card--selected" : ""}`}
              id={`session-question-card-${item.id}`}
              key={item.id}
              style={{ marginLeft: `${item.depth * 16}px` }}
            >
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>#{item.orderIndex + 1}</span>
                  <span>{item.difficultyLabel}</span>
                  {item.categoryName ? <span>{item.categoryName}</span> : null}
                  <span>{item.status}</span>
                  {item.contentLocale ? (
                    <span>
                      {item.contentLocale === "ko"
                        ? t("common.generatedInKorean")
                        : t("common.generatedInEnglish")}
                    </span>
                  ) : null}
                  {isAiFollowUp ? (
                    <span className="question-status-badge question-status-badge--accent">AI follow-up</span>
                  ) : item.isFollowUp ? (
                    <span className="question-status-badge question-status-badge--neutral">Follow-up</span>
                  ) : (
                    <span className="question-status-badge question-status-badge--neutral">{item.sourceLabel}</span>
                  )}
                </div>
                <h3 className="list-item-card__title">{item.title}</h3>
                {item.bodyText ? <p className="list-item-card__body">{item.bodyText}</p> : null}
                {item.revisitLabel ? (
                  <p className="resume-section__helper interview-question-revisit-note">{item.revisitLabel}</p>
                ) : null}
                {item.focusSkillNames.length > 0 ? (
                  <div className="chip-list">
                    {item.focusSkillNames.map((skill) => (
                      <span className="detail-chip detail-chip--accent" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.tags.length > 0 ? (
                  <div className="chip-list">
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
                    Open catalog question
                  </Link>
                ) : null}
                {item.answerAttemptId ? (
                  <Link
                    className="secondary-button"
                    to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: item.answerAttemptId })}
                  >
                    Open answer result
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
