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
        ? "오늘 배정된 핵심 질문 하나에 먼저 답하세요."
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
        ? "새 메인 질문이 없으면 재도전 큐 한 항목부터 정리하세요."
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
        ? "다음 세션 전 보강이 필요한 주장부터 확인하세요."
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
      ? "대기 중인 작업이 없으면 다음 질문이나 스킬 공백을 고르세요."
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
          <h2 className="page-card__title">{nextAction.title}</h2>
          <p className="page-card__body">{nextAction.body}</p>
        </div>
        <div className="home-next-action-card__highlights">
          <article className="home-next-action-card__highlight">
            <span>{isKorean ? "바로 실행" : "Now"}</span>
            <strong>{nextAction.primaryAction.label}</strong>
          </article>
          <article className="home-next-action-card__highlight">
            <span>{isKorean ? "대안 경로" : "Fallback"}</span>
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
      <div className="home-next-action-card__rail">
        <article className="home-next-action-card__rail-item home-next-action-card__rail-item--accent">
          <span>{isKorean ? "우선 순서" : "Priority"}</span>
          <strong>{isKorean ? "오늘 질문 → 재도전 → 리스크 정리" : "Today → Retry → Risks"}</strong>
        </article>
        <article className="home-next-action-card__rail-item">
          <span>{isKorean ? "운영 원칙" : "Rule"}</span>
          <strong>{isKorean ? "새 분기를 열기 전에 기존 약점을 먼저 닫습니다." : "Close weak branches before opening new ones."}</strong>
        </article>
      </div>
    </section>
  );
}
