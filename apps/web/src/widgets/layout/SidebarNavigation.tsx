import { NavLink } from "react-router-dom";
import { secondaryDesktopRoutes, tabRoutes } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

export function SidebarNavigation() {
  const { t } = useLocale();

  function getRouteLabel(path: string) {
    switch (path) {
      case "/":
        return t("navigation.home");
      case "/practice":
        return t("navigation.practice");
      case "/archive":
        return t("navigation.archive");
      case "/feed":
        return t("navigation.feed");
      case "/profile":
        return t("navigation.profile");
      case "/skills":
        return t("navigation.skills");
      case "/interviews":
        return t("navigation.interview");
      case "/practical-interviews":
        return t("navigation.practicalInterviews");
      case "/profile/resumes/analysis":
        return t("navigation.resumeAnalysis");
      case "/resume-tailor":
        return t("navigation.resumeTailor");
      case "/resume-tailor/job-postings":
        return t("navigation.resumeTailor");
      default:
        return path;
    }
  }

  return (
    <aside className="sidebar-navigation">
      <div className="sidebar-navigation__brand">
        <span className="sidebar-navigation__eyebrow">Interview practice</span>
        <strong className="sidebar-navigation__title">iterview</strong>
        <p className="sidebar-navigation__summary">
          Practice answers, review signals, and refine your resume story.
        </p>
      </div>

      <nav aria-label="Primary" className="sidebar-navigation__nav">
        {tabRoutes.map((route, index) => (
          <NavLink
            key={route.path}
            className={({ isActive }) =>
              `sidebar-navigation__link${isActive ? " sidebar-navigation__link--active" : ""}`
            }
            to={route.buildPath()}
          >
            <span aria-hidden="true" className="sidebar-navigation__icon">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            <span className="sidebar-navigation__link-copy">
              <strong>{getRouteLabel(route.path)}</strong>
              <span>Primary workspace</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-navigation__section">
        <span className="sidebar-navigation__section-label">{t("navigation.interviewIntelligence")}</span>
        <nav aria-label="Workspace" className="sidebar-navigation__nav sidebar-navigation__nav--secondary">
          {secondaryDesktopRoutes.map((route) => (
            <NavLink
              key={route.path}
              className={({ isActive }) =>
                `sidebar-navigation__link${isActive ? " sidebar-navigation__link--active" : ""}`
              }
              to={route.buildPath()}
            >
              <span className="sidebar-navigation__link-copy">
                <strong>{getRouteLabel(route.path)}</strong>
                <span>Deep-dive workspace</span>
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
