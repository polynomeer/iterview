import { Link, useLocation } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";

export function GuestHomeIntro() {
  const location = useLocation();

  return (
    <section className="guest-home">
      <div className="guest-home__hero">
        <div className="guest-home__hero-copy">
          <span className="page-card__label">Resume-grounded mock interview</span>
          <h2 className="guest-home__title">Pressure-test every resume claim until it holds up under DFS follow-ups</h2>
          <p className="guest-home__body">
            Iterview builds a detailed source of truth from your resume, expands each topic into
            deeper follow-up branches, and helps you simulate answers before the real interview.
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
            <span className="guest-home__metric-label">1. Build context</span>
            <strong className="guest-home__metric-value">Turn resume lines into verifiable interview evidence</strong>
          </article>
          <article className="guest-home__metric">
            <span className="guest-home__metric-label">2. Traverse the tree</span>
            <strong className="guest-home__metric-value">Walk every follow-up branch until the details become atomic</strong>
          </article>
          <article className="guest-home__metric">
            <span className="guest-home__metric-label">3. Simulate answers</span>
            <strong className="guest-home__metric-value">Rehearse weak spots, retry, and tighten the source of truth</strong>
          </article>
        </div>
      </div>

      <div className="guest-home__grid">
        <article className="guest-home__card">
          <span className="page-card__label">Question tree</span>
          <h3 className="page-card__title">Interview depth is driven by structured follow-up paths</h3>
          <p className="page-card__body">
            Start from a single claim and keep drilling into scope, trade-offs, decisions, metrics,
            and failures until the interviewer has nowhere left to poke.
          </p>
        </article>
        <article className="guest-home__card">
          <span className="page-card__label">Source of truth</span>
          <h3 className="page-card__title">Keep a written understanding of what your resume really means</h3>
          <p className="page-card__body">
            Capture the real project context, constraints, architecture, and outcomes so your
            answers stay consistent across every branch of questioning.
          </p>
        </article>
        <article className="guest-home__card">
          <span className="page-card__label">Answer simulation</span>
          <h3 className="page-card__title">Practice, inspect weak points, and immediately retry</h3>
          <p className="page-card__body">
            Review your answer quality, identify vague claims, and loop back into the exact question
            branch that still needs work.
          </p>
        </article>
      </div>
    </section>
  );
}
