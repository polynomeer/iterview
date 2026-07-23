import { Link } from "react-router-dom";
import type { HomeModel } from "../../entities/home/model";
import { routeConfig } from "../../shared/config/routes";

type HomeNextActionCardProps = {
  home: HomeModel;
};

function getNextAction(home: HomeModel) {
  if (home.todayQuestion) {
    return {
      label: "Today",
      title: "Start today&apos;s main interview question",
      body: "The clearest next action is to answer the primary question scheduled for you today.",
      primaryAction: {
        label: "Start answer",
        to: routeConfig.answerEditor.buildPath({ questionId: home.todayQuestion.id }),
      },
      secondaryAction: {
        label: "Review detail",
        to: routeConfig.questionDetail.buildPath({ questionId: home.todayQuestion.id }),
      },
    };
  }

  if (home.retryQuestions.length > 0) {
    return {
      label: "Review",
      title: "Clear one retry item from the queue",
      body: "There is no fresh daily prompt right now, so the best next action is to revisit scheduled follow-up practice.",
      primaryAction: {
        label: "Open review queue",
        to: routeConfig.reviewQueue.buildPath(),
      },
      secondaryAction: {
        label: "Browse practice",
        to: routeConfig.practice.buildPath(),
      },
    };
  }

  if (home.resumeRiskPreview.length > 0) {
    return {
      label: "Resume",
      title: "Review the latest resume risks",
      body: "Your resume analysis surfaced claims worth strengthening before your next session.",
      primaryAction: {
        label: "Open resume analysis",
        to: routeConfig.resumeAnalysis.buildPath(),
      },
      secondaryAction: {
        label: "Open skills",
        to: routeConfig.skills.buildPath(),
      },
    };
  }

  return {
    label: "Momentum",
    title: "Choose the next question that fits your goal",
    body: "When there is no scheduled item waiting, browse the question set or inspect your skill dashboard for the next gap to close.",
    primaryAction: {
      label: "Browse practice",
      to: routeConfig.practice.buildPath(),
    },
    secondaryAction: {
      label: "Open skills",
      to: routeConfig.skills.buildPath(),
    },
  };
}

export function HomeNextActionCard({ home }: HomeNextActionCardProps) {
  const nextAction = getNextAction(home);

  return (
    <section className="page-card home-next-action-card">
      <span className="page-card__label">{nextAction.label}</span>
      <h2 className="page-card__title">{nextAction.title}</h2>
      <p className="page-card__body">{nextAction.body}</p>
      <div className="page-card__actions">
        <Link className="primary-button" to={nextAction.primaryAction.to}>
          {nextAction.primaryAction.label}
        </Link>
        <Link className="secondary-button" to={nextAction.secondaryAction.to}>
          {nextAction.secondaryAction.label}
        </Link>
      </div>
    </section>
  );
}
