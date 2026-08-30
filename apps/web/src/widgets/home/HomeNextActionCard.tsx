import { Link } from "react-router-dom";
import type { HomeModel } from "../../entities/home/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type HomeNextActionCardProps = {
  home: HomeModel;
};

function getNextAction(home: HomeModel, isKorean: boolean) {
  if (home.todayQuestion) {
    return {
      label: isKorean ? "오늘" : "Today",
      title: isKorean ? "오늘의 메인 면접 질문부터 시작하세요" : "Start today&apos;s main interview question",
      body: isKorean
        ? "가장 분명한 다음 행동은 오늘 배정된 핵심 질문에 답해보는 것입니다."
        : "The clearest next action is to answer the primary question scheduled for you today.",
      primaryAction: {
        label: isKorean ? "답변 시작" : "Start answer",
        to: routeConfig.answerEditor.buildPath({ questionId: home.todayQuestion.id }),
      },
      secondaryAction: {
        label: isKorean ? "상세 검토" : "Review detail",
        to: routeConfig.questionDetail.buildPath({ questionId: home.todayQuestion.id }),
      },
    };
  }

  if (home.retryQuestions.length > 0) {
    return {
      label: isKorean ? "복기" : "Review",
      title: isKorean ? "재도전 큐에서 하나를 먼저 해결하세요" : "Clear one retry item from the queue",
      body: isKorean
        ? "지금은 새로운 오늘의 질문 문구가 없으므로, 예약된 꼬리질문 연습을 다시 보는 것이 가장 좋습니다."
        : "There is no fresh daily prompt right now, so the best next action is to revisit scheduled follow-up practice.",
      primaryAction: {
        label: isKorean ? "복습 큐 열기" : "Open review queue",
        to: routeConfig.reviewQueue.buildPath(),
      },
      secondaryAction: {
        label: isKorean ? "연습 둘러보기" : "Browse practice",
        to: routeConfig.practice.buildPath(),
      },
    };
  }

  if (home.resumeRiskPreview.length > 0) {
    return {
      label: isKorean ? "이력서" : "Resume",
      title: isKorean ? "최신 이력서 리스크를 먼저 확인하세요" : "Review the latest resume risks",
      body: isKorean
        ? "다음 세션 전에 더 보강해야 할 주장들이 이력서 분석에서 드러났습니다."
        : "Your resume analysis surfaced claims worth strengthening before your next session.",
      primaryAction: {
        label: isKorean ? "이력서 분석 열기" : "Open resume analysis",
        to: routeConfig.resumeAnalysis.buildPath(),
      },
      secondaryAction: {
        label: isKorean ? "스킬 보기" : "Open skills",
        to: routeConfig.skills.buildPath(),
      },
    };
  }

  return {
    label: isKorean ? "흐름 유지" : "Momentum",
    title: isKorean ? "지금 목표에 맞는 다음 질문을 고르세요" : "Choose the next question that fits your goal",
    body: isKorean
      ? "대기 중인 예약 작업이 없다면 질문 목록을 보거나 스킬 대시보드에서 다음 보강 지점을 확인하세요."
      : "When there is no scheduled item waiting, browse the question set or inspect your skill dashboard for the next gap to close.",
    primaryAction: {
      label: isKorean ? "연습 둘러보기" : "Browse practice",
      to: routeConfig.practice.buildPath(),
    },
    secondaryAction: {
      label: isKorean ? "스킬 보기" : "Open skills",
      to: routeConfig.skills.buildPath(),
    },
  };
}

export function HomeNextActionCard({ home }: HomeNextActionCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const nextAction = getNextAction(home, isKorean);

  return (
    <section className="page-card home-next-action-card">
      <div className="home-next-action-card__header">
        <div className="home-next-action-card__intro">
          <div className="home-next-action-card__eyebrow-row">
            <span className="page-card__label">{nextAction.label}</span>
            <span className="detail-chip detail-chip--accent">{isKorean ? "다음 액션" : "Next action"}</span>
          </div>
          <p className="home-next-action-card__breadcrumbs">
            {isKorean ? "지금 결정" : "Decide now"}
            <span>/</span>
            {isKorean ? "한 경로로 실행" : "Act in one path"}
            <span>/</span>
            {isKorean ? "맥락 이탈 방지" : "Avoid context drift"}
          </p>
          <h2 className="page-card__title">{nextAction.title}</h2>
          <p className="page-card__body">{nextAction.body}</p>
        </div>
        <div className="home-next-action-card__highlights">
          <article className="home-next-action-card__highlight">
            <span>{isKorean ? "주 경로" : "Primary lane"}</span>
            <strong>{nextAction.primaryAction.label}</strong>
          </article>
          <article className="home-next-action-card__highlight">
            <span>{isKorean ? "보조 경로" : "Fallback lane"}</span>
            <strong>{nextAction.secondaryAction.label}</strong>
          </article>
        </div>
      </div>
      <div className="page-card__actions">
        <Link className="primary-button" to={nextAction.primaryAction.to}>
          {nextAction.primaryAction.label}
        </Link>
        <Link className="secondary-button" to={nextAction.secondaryAction.to}>
          {nextAction.secondaryAction.label}
        </Link>
      </div>
      <div className="home-next-action-card__footer">
        <span className="detail-chip">{isKorean ? "다음 한 수를 명확하게" : "Single clear next move"}</span>
        <span className="detail-chip">{isKorean ? "연습 세션의 초점을 유지" : "Keep the practice session focused"}</span>
      </div>
    </section>
  );
}
