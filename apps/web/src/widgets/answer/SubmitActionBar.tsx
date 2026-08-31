import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { useLocale } from "../../shared/i18n";

type SubmitActionBarProps = {
  isSubmitDisabled: boolean;
  isPending: boolean;
  validationMessage: string | null;
  errorMessage: string | null;
  errorDetails?: string[];
  infoMessage?: string | null;
  onSubmit: () => void;
};

export function SubmitActionBar({
  isSubmitDisabled,
  isPending,
  validationMessage,
  errorMessage,
  errorDetails = [],
  infoMessage,
  onSubmit,
}: SubmitActionBarProps) {
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const executionSignal = validationMessage
    ? isKorean
      ? "제출 보류"
      : "Hold submission"
    : isPending
      ? isKorean
        ? "제출 중"
        : "Submitting now"
      : isSubmitDisabled
        ? isKorean
          ? "초안 미완성"
          : "Draft incomplete"
        : isKorean
          ? "제출 준비 완료"
          : "Ready to submit";
  const readinessItems = [
    {
      label: isKorean ? "질문 문구 응답 상태" : "Prompt answered",
      state: validationMessage ? (isKorean ? "보완 필요" : "Needs work") : isKorean ? "준비됨" : "Ready",
    },
    {
      label: isKorean ? "제출 레인" : "Submission lane",
      state: isPending ? (isKorean ? "제출 중" : "Submitting") : isKorean ? "대기 중" : "Standing by",
    },
  ];

  return (
    <section className="page-card answer-submit-card">
      <div className="answer-submit-card__header">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">{t("answer.submitEyebrow")}</p>
            <h2 className="page-card__title">{t("answer.submitTitle")}</h2>
          </div>
        </div>
        <div className="answer-submit-card__summary" aria-label={isKorean ? "제출 준비 상태" : "Submission readiness"}>
          {readinessItems.map((item) => (
            <article className="answer-submit-card__summary-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.state}</strong>
            </article>
          ))}
        </div>
      </div>
      <div className="answer-submit-card__signal">
        <strong>{executionSignal}</strong>
        <span>
          {isKorean
            ? "주장이 직접적이고, 근거가 구체적이며, 가장 약한 꼬리질문 지점까지 이미 예상했을 때만 제출하세요."
            : "Submit only when the claim is direct, the evidence is concrete, and the weakest follow-up line is already anticipated."}
        </span>
      </div>
      <div className="answer-submit-card__summary-bar">
        <span className="detail-chip detail-chip--accent">{executionSignal}</span>
        <span className="detail-chip">{isKorean ? "정확한 주장 확인" : "Confirm exact claim"}</span>
        <span className="detail-chip">{isKorean ? "근거 한 줄 점검" : "Check one evidence line"}</span>
      </div>
      <p className="answer-submit-card__body">
        {isKorean
          ? "현재 초안이 정확한 노드에 답하고, 다음 브랜치가 가장 먼저 파고들 사실까지 명시했을 때만 제출하세요."
          : "Submit only after the current draft answers the exact node and names the fact the next branch is most likely to probe."}
      </p>
      <div className="answer-submit-card__lanes">
        <article className="answer-submit-card__lane">
          <strong>{isKorean ? "주장" : "Claim"}</strong>
          <span>{isKorean ? "배경 설명보다 직접적인 답부터 먼저 제시하세요." : "Open with the direct answer instead of background setup."}</span>
        </article>
        <article className="answer-submit-card__lane">
          <strong>{isKorean ? "근거" : "Evidence"}</strong>
          <span>
            {isKorean
              ? "답변을 방어 가능하게 만드는 수치, 제약, 실제 시스템 조건을 명시하세요."
              : "Name the metric, constraint, or real system condition that makes the answer defensible."}
          </span>
        </article>
        <article className="answer-submit-card__lane">
          <strong>{isKorean ? "꼬리질문" : "Follow-up"}</strong>
          <span>
            {isKorean
              ? "다음 질문은 가장 근거 없는 문장을 압박한다고 가정하세요."
              : "Assume the next question will pressure-test the weakest unsupported phrase."}
          </span>
        </article>
      </div>
      {infoMessage ? <FeedbackNotice message={infoMessage} tone="info" /> : null}
      {validationMessage ? <FeedbackNotice message={validationMessage} tone="error" /> : null}
      {errorMessage ? <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" /> : null}
      <div className="page-card__actions">
        <button
          className="primary-button"
          disabled={isSubmitDisabled || isPending}
          onClick={onSubmit}
          type="button"
        >
          {isPending ? t("answer.submitting") : t("interview.submitAnswer")}
        </button>
      </div>
    </section>
  );
}
