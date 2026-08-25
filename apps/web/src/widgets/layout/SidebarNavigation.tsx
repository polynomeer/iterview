import { NavLink } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useAuth } from "../../shared/auth/useAuth";

export function SidebarNavigation() {
  const { isAuthenticated } = useAuth();
  const workspaceLinks = isAuthenticated
    ? [
        { label: "Today", to: routeConfig.home.buildPath() },
        { label: "Interview Workspace", to: routeConfig.interview.buildPath() },
        { label: "Question Map", to: routeConfig.practice.buildPath() },
        { label: "Review Queue", to: routeConfig.reviewQueue.buildPath() },
        { label: "Archive", to: routeConfig.archive.buildPath() },
      ]
    : [
        { label: "Home", to: routeConfig.home.buildPath() },
        { label: "Question Map", to: routeConfig.practice.buildPath() },
        { label: "Feed", to: routeConfig.feed.buildPath() },
      ];
  const careerLinks = isAuthenticated
    ? [
        { label: "Resume", to: routeConfig.resume.buildPath() },
        { label: "Resume Analysis", to: routeConfig.resumeAnalysis.buildPath() },
        { label: "Skills", to: routeConfig.skills.buildPath() },
      ]
    : [
        { label: "Login", to: routeConfig.login.buildPath() },
        { label: "Sign Up", to: routeConfig.signup.buildPath() },
      ];
  const manageLinks = isAuthenticated
    ? [
        { label: "Target Companies", to: routeConfig.resumeTailorJobPostings.buildPath() },
        { label: "Notes", to: routeConfig.notes.buildPath() },
        { label: "Bookmarks", to: routeConfig.bookmarks.buildPath() },
      ]
    : [];

  return (
    <aside className="sidebar-navigation">
      <div className="sidebar-navigation__brand">
        <div className="sidebar-navigation__brand-row">
          <strong className="sidebar-navigation__title">Iterview</strong>
          <span className="sidebar-navigation__pro-badge">DFS prep</span>
        </div>
        <p className="sidebar-navigation__summary">
          Resume-first interview practice.
        </p>
      </div>

      <nav aria-label="Workspace" className="sidebar-navigation__nav">
        {workspaceLinks.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              `sidebar-navigation__link${isActive ? " sidebar-navigation__link--active" : ""}`
            }
            to={link.to}
          >
            <span aria-hidden="true" className="sidebar-navigation__icon" />
            <span className="sidebar-navigation__link-copy sidebar-navigation__link-copy--single">
              <strong>{link.label}</strong>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-navigation__section">
        <span className="sidebar-navigation__section-label">{isAuthenticated ? "Career" : "Account"}</span>
        <nav aria-label="Career" className="sidebar-navigation__nav sidebar-navigation__nav--secondary">
          {careerLinks.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `sidebar-navigation__link${isActive ? " sidebar-navigation__link--active" : ""}`
              }
              to={link.to}
            >
              <span aria-hidden="true" className="sidebar-navigation__icon sidebar-navigation__icon--secondary" />
              <span className="sidebar-navigation__link-copy sidebar-navigation__link-copy--single">
                <strong>{link.label}</strong>
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {manageLinks.length > 0 ? (
        <div className="sidebar-navigation__section">
          <span className="sidebar-navigation__section-label">Manage</span>
          <nav aria-label="Manage" className="sidebar-navigation__nav sidebar-navigation__nav--secondary">
            {manageLinks.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  `sidebar-navigation__link${isActive ? " sidebar-navigation__link--active" : ""}`
                }
                to={link.to}
              >
                <span aria-hidden="true" className="sidebar-navigation__icon sidebar-navigation__icon--secondary" />
                <span className="sidebar-navigation__link-copy sidebar-navigation__link-copy--single">
                  <strong>{link.label}</strong>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}

      {isAuthenticated ? (
        <section className="sidebar-navigation__progress-card">
          <span className="sidebar-navigation__section-label">Workflow</span>
          <p className="sidebar-navigation__progress-range">Resume → DFS questions → answer review</p>
          <div className="sidebar-navigation__progress-value-row">
            <strong className="sidebar-navigation__progress-value">Focus</strong>
            <span className="sidebar-navigation__progress-delta">Keep one claim, one branch, one answer loop.</span>
          </div>
        </section>
      ) : (
        <section className="sidebar-navigation__progress-card sidebar-navigation__progress-card--compact">
          <span className="sidebar-navigation__section-label">Core loop</span>
          <p className="sidebar-navigation__progress-range">Source of truth, DFS follow-ups, answer rehearsal.</p>
        </section>
      )}
    </aside>
  );
}
