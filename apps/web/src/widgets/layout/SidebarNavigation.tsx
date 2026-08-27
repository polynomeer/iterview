import { NavLink } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useAuth } from "../../shared/auth/useAuth";
import { useLocale } from "../../shared/i18n";

export function SidebarNavigation() {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();
  const workspaceLinks = isAuthenticated
    ? [
        { label: t("sidebar.today"), to: routeConfig.home.buildPath() },
        { label: t("header.workspaceTitle"), to: routeConfig.interview.buildPath() },
        { label: t("sidebar.questionMap"), to: routeConfig.practice.buildPath() },
        { label: t("navigation.reviewQueue"), to: routeConfig.reviewQueue.buildPath() },
        { label: t("sidebar.scheduledReviews"), to: routeConfig.scheduledReviews.buildPath() },
        { label: t("sidebar.weakNodes"), to: routeConfig.weakNodes.buildPath() },
        { label: t("navigation.archive"), to: routeConfig.archive.buildPath() },
      ]
    : [
        { label: t("navigation.home"), to: routeConfig.home.buildPath() },
        { label: t("sidebar.questionMap"), to: routeConfig.practice.buildPath() },
        { label: t("navigation.feed"), to: routeConfig.feed.buildPath() },
      ];
  const careerLinks = isAuthenticated
    ? [
        { label: t("navigation.resume"), to: routeConfig.resume.buildPath() },
        { label: t("navigation.resumeAnalysis"), to: routeConfig.resumeAnalysis.buildPath() },
        { label: t("navigation.skills"), to: routeConfig.skills.buildPath() },
      ]
    : [
        { label: t("common.login"), to: routeConfig.login.buildPath() },
        { label: t("common.signUp"), to: routeConfig.signup.buildPath() },
      ];
  const manageLinks = isAuthenticated
    ? [
        { label: t("settings.eyebrow"), to: routeConfig.settings.buildPath() },
        { label: t("sidebar.targetCompanies"), to: routeConfig.targetCompanies.buildPath() },
        { label: t("sidebar.notes"), to: routeConfig.notes.buildPath() },
        { label: t("sidebar.bookmarks"), to: routeConfig.bookmarks.buildPath() },
      ]
    : [];

  return (
    <aside className="sidebar-navigation">
      <div className="sidebar-navigation__brand">
        <div className="sidebar-navigation__brand-row">
          <strong className="sidebar-navigation__title">Iterview</strong>
          <span className="sidebar-navigation__pro-badge">{t("sidebar.brandBadge")}</span>
        </div>
        <p className="sidebar-navigation__summary">
          {t("sidebar.brandSummary")}
        </p>
      </div>

      <nav aria-label={t("sidebar.workspace")} className="sidebar-navigation__nav">
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
        <span className="sidebar-navigation__section-label">{isAuthenticated ? t("sidebar.career") : t("sidebar.account")}</span>
        <nav aria-label={isAuthenticated ? t("sidebar.career") : t("sidebar.account")} className="sidebar-navigation__nav sidebar-navigation__nav--secondary">
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
          <span className="sidebar-navigation__section-label">{t("sidebar.manage")}</span>
          <nav aria-label={t("sidebar.manage")} className="sidebar-navigation__nav sidebar-navigation__nav--secondary">
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
          <span className="sidebar-navigation__section-label">{t("sidebar.workflow")}</span>
          <p className="sidebar-navigation__progress-range">{t("sidebar.workflowRange")}</p>
          <div className="sidebar-navigation__progress-value-row">
            <strong className="sidebar-navigation__progress-value">{t("sidebar.workflowFocus")}</strong>
            <span className="sidebar-navigation__progress-delta">{t("sidebar.workflowFocusBody")}</span>
          </div>
        </section>
      ) : (
        <section className="sidebar-navigation__progress-card sidebar-navigation__progress-card--compact">
          <span className="sidebar-navigation__section-label">{t("sidebar.coreLoop")}</span>
          <p className="sidebar-navigation__progress-range">{t("sidebar.coreLoopBody")}</p>
        </section>
      )}
    </aside>
  );
}
