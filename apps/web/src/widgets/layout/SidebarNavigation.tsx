import { NavLink } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";

export function SidebarNavigation() {
  const workspaceLinks = [
    { label: "Workspace", to: routeConfig.interview.buildPath(), badge: null },
    { label: "Today", to: routeConfig.home.buildPath(), badge: "3" },
    { label: "Question Map", to: routeConfig.practice.buildPath(), badge: null },
    { label: "Practice", to: routeConfig.skills.buildPath(), badge: null },
    { label: "Review", to: routeConfig.reviewQueue.buildPath(), badge: "12" },
    { label: "Archive", to: routeConfig.archive.buildPath(), badge: null },
  ] as const;
  const careerLinks = [
    { label: "Career Context", to: routeConfig.profile.buildPath(), badge: null },
    { label: "Resume", to: routeConfig.resume.buildPath(), badge: "v4" },
    { label: "Experience", to: routeConfig.resumeAnalysis.buildPath(), badge: null },
    { label: "Skills", to: routeConfig.skills.buildPath(), badge: null },
  ] as const;
  const manageLinks = [
    { label: "Target Companies", to: routeConfig.resumeTailorJobPostings.buildPath(), badge: null },
    { label: "Notes", to: routeConfig.feed.buildPath(), badge: null },
    { label: "Bookmarks", to: routeConfig.practicalInterviews.buildPath(), badge: null },
  ] as const;

  return (
    <aside className="sidebar-navigation">
      <div className="sidebar-navigation__brand">
        <div className="sidebar-navigation__brand-row">
          <strong className="sidebar-navigation__title">Iterview</strong>
          <span className="sidebar-navigation__pro-badge">PRO</span>
        </div>
        <p className="sidebar-navigation__summary">Career knowledge IDE for DFS interview preparation.</p>
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
            {link.badge ? <span className="sidebar-navigation__badge">{link.badge}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-navigation__section">
        <span className="sidebar-navigation__section-label">Career</span>
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
              {link.badge ? <span className="sidebar-navigation__badge">{link.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
      </div>

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

      <section className="sidebar-navigation__progress-card">
        <span className="sidebar-navigation__section-label">Weekly Progress</span>
        <p className="sidebar-navigation__progress-range">May 12 - May 18</p>
        <div className="sidebar-navigation__progress-value-row">
          <strong className="sidebar-navigation__progress-value">72%</strong>
          <span className="sidebar-navigation__progress-delta">+8% vs last week</span>
        </div>
        <div aria-hidden="true" className="sidebar-navigation__progress-chart">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
    </aside>
  );
}
