import { Link } from "react-router-dom";
import type { HomeModel, HomeQuestionCardModel } from "../../entities/home/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";

type TodayQuestionCardProps = {
  question: HomeQuestionCardModel;
  radarItems?: HomeModel["skillRadarPreview"];
  retryQuestions?: HomeModel["retryQuestions"];
};

export function TodayQuestionCard({ question, radarItems = [], retryQuestions = [] }: TodayQuestionCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const pathItems = [
    {
      key: "anchor",
      label: isKorean ? "앵커 질문" : "Anchor prompt",
      value: question.categoryLabel,
      tone: "accent",
    },
    {
      key: "probe",
      label: isKorean ? "다음 탐색" : "Next probe",
      value: isKorean ? "꼬리질문 트리" : "Follow-up tree",
      tone: "default",
    },
    {
      key: "defense",
      label: isKorean ? "방어 기준" : "Defense note",
      value: isKorean ? "근거와 반례 정리" : "Evidence and counter-cases",
      tone: "default",
    },
  ];
  const graphNodes = [
    ...radarItems.slice(0, 3).map((item) => ({ id: `skill-${item.id}`, label: item.label, value: `${item.scoreLabel}%`, tone: "positive" })),
    // Titles are already shown in the card and retry list; graph nodes stay short labels.
    { id: "focus", label: isKorean ? "현재 질문" : "Current question", value: question.difficultyLabel, tone: "focus" },
    ...retryQuestions.slice(0, 2).map((item, index) => ({
      id: `retry-${item.id}`,
      label: isKorean ? `재도전 ${index + 1}` : `Retry ${index + 1}`,
      value: item.difficultyLabel,
      tone: "warning",
    })),
  ];

  return (
    <section className="today-question-card">
      <div className="today-question-card__header">
        <div className="today-question-card__intro">
          <div className="today-question-card__eyebrow-row">
            <span className="page-card__label">{isKorean ? "오늘의 포커스" : "Today's focus"}</span>
            <QuestionStatusBadge status={question.status} />
          </div>
          <p className="today-question-card__subtitle">
            {isKorean ? "오늘의 메인 경로" : "Today's main path"}
          </p>
        </div>
        <div className="today-question-card__summary">
          <article className="today-question-card__summary-item">
            <span>{isKorean ? "질문 유형" : "Track"}</span>
            <strong>{question.categoryLabel}</strong>
          </article>
          <article className="today-question-card__summary-item">
            <span>{isKorean ? "난이도" : "Level"}</span>
            <strong>{question.difficultyLabel}</strong>
          </article>
        </div>
      </div>
      <div className="today-question-card__body-grid">
        <div className="today-question-card__content">
          <h2 className="today-question-card__title">{question.title}</h2>
          <p className="today-question-card__meta">{question.categoryLabel} · {question.difficultyLabel}</p>
          <p className="today-question-card__prompt">{question.prompt}</p>
          <div className="today-question-card__chips">
            <span className="detail-chip detail-chip--accent">{isKorean ? "추천 경로" : "Recommended path"}</span>
            <span className="detail-chip">{question.categoryLabel}</span>
            <span className="detail-chip">{question.difficultyLabel}</span>
          </div>
          <div className="today-question-card__focus-map" aria-label={isKorean ? "지식 그래프 스냅샷" : "Knowledge graph snapshot"}>
            <div className="today-question-card__focus-map-grid" aria-hidden="true" />
            {graphNodes.map((node) => (
              <div className={`today-question-card__focus-node today-question-card__focus-node--${node.tone}`} key={node.id}>
                <span>{node.label}</span>
                <strong>{node.value}</strong>
              </div>
            ))}
          </div>
          <div className="page-card__actions">
            <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: question.id })}>
              {isKorean ? "답변 이어가기" : "Continue answering"}
            </Link>
            <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: question.id })}>
              {isKorean ? "경로 보기" : "View path"}
            </Link>
          </div>
        </div>
        <div className="today-question-card__path">
          <div className="today-question-card__path-header">
            <span className="page-card__label">{isKorean ? "오늘의 경로" : "Today's path"}</span>
          </div>
          <div className="today-question-card__path-list">
            {pathItems.map((item, index) => (
              <article
                className={`today-question-card__path-item ${index === 0 ? "today-question-card__path-item--active" : ""}`}
                key={item.key}
              >
                <div className="today-question-card__path-item-index">{index + 1}</div>
                <div className="today-question-card__path-item-copy">
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
                <div className={`today-question-card__path-item-status today-question-card__path-item-status--${item.tone}`}>
                  {index < 2 ? (isKorean ? "준비됨" : "Ready") : (isKorean ? "확인" : "Check")}
                </div>
              </article>
            ))}
          </div>
          <p className="today-question-card__path-footnote">
            {isKorean
              ? "현재 질문을 잠근 뒤 꼬리질문과 반례 검증으로 DFS를 이어갑니다."
              : "Lock the anchor answer, then continue DFS with follow-ups and counter-cases."}
          </p>
        </div>
      </div>
      <p className="today-question-card__note">
        {isKorean
          ? "샘플 워크스페이스처럼 메인 경로와 우측 컨텍스트를 함께 보며, 한 번에 한 분기만 깊게 방어하세요."
          : "Keep the main path and context rail visible together, and defend one branch deeply at a time."}
      </p>
    </section>
  );
}
