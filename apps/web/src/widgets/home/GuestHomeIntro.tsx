import { Link, useLocation } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";

export function GuestHomeIntro() {
  const location = useLocation();

  return (
    <section className="guest-home">
      <div className="guest-home__hero">
        <div className="guest-home__hero-copy">
          <span className="page-card__label">Iterview</span>
          <h2 className="guest-home__title">Your personalized home is available after sign-in</h2>
          <p className="guest-home__body">
            Resume-driven interview prep, daily question flow, skill radar, review queue, and
            answer analysis all come together here once your workspace is active.
          </p>
          <div className="page-card__actions">
            <Link
              className="primary-button"
              state={{ redirectTo: `${location.pathname}${location.search}` }}
              to={routeConfig.login.buildPath()}
            >
              Login
            </Link>
            <Link className="secondary-button" to={routeConfig.signup.buildPath()}>
              Create account
            </Link>
            <Link className="secondary-button" to={routeConfig.practice.buildPath()}>
              Browse practice questions
            </Link>
          </div>
        </div>
        <div className="guest-home__metrics">
          <article className="guest-home__metric">
            <span className="guest-home__metric-label">Daily loop</span>
            <strong className="guest-home__metric-value">Question → Answer → Review</strong>
          </article>
          <article className="guest-home__metric">
            <span className="guest-home__metric-label">Resume intelligence</span>
            <strong className="guest-home__metric-value">Risks, skills, and follow-up prompts</strong>
          </article>
          <article className="guest-home__metric">
            <span className="guest-home__metric-label">Skill readiness</span>
            <strong className="guest-home__metric-value">Radar, gaps, and progress snapshots</strong>
          </article>
        </div>
      </div>

      <div className="guest-home__grid">
        <article className="guest-home__card">
          <span className="page-card__label">Resume-driven prep</span>
          <h3 className="page-card__title">Turn resume claims into interview defense practice</h3>
          <p className="page-card__body">
            Surface extracted skills, experiences, and risks so your next questions match what you
            actually need to defend.
          </p>
        </article>
        <article className="guest-home__card">
          <span className="page-card__label">Question learning loop</span>
          <h3 className="page-card__title">Practice with tree-based follow-ups and retry flow</h3>
          <p className="page-card__body">
            Move from the main question into deeper follow-ups, then revisit weak answers through a
            dedicated review queue.
          </p>
        </article>
        <article className="guest-home__card">
          <span className="page-card__label">Answer analysis</span>
          <h3 className="page-card__title">See what changed after each answer attempt</h3>
          <p className="page-card__body">
            Track score breakdowns, weakness summaries, and next-step guidance without losing your
            place in the study loop.
          </p>
        </article>
      </div>
    </section>
  );
}
