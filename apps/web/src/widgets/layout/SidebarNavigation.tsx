import { NavLink } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useAuth } from "../../shared/auth/useAuth";
import { useLocale } from "../../shared/i18n";
import { Icon, type IconName } from "../../shared/ui/primitives";

export function SidebarNavigation() {
  const { isAuthenticated } = useAuth();
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const workspaceLinks = isAuthenticated
    ? [
        {
          caption: t("sidebar.workspace"),
          items: [
            { label: t("header.workspaceTitle"), meta: t("sidebar.brandSummary"), to: routeConfig.interview.buildPath(), icon: "interview" as IconName },
            { label: t("sidebar.today"), meta: t("header.workspaceEyebrow"), to: routeConfig.home.buildPath(), icon: "today" as IconName },
            { label: t("sidebar.questionMap"), meta: t("practice.searchQuestions"), to: routeConfig.practice.buildPath(), icon: "questions" as IconName },
            { label: t("navigation.reviewQueue"), meta: isAuthenticated ? t("sidebar.workflow") : "Review", to: routeConfig.reviewQueue.buildPath(), icon: "review" as IconName },
            { label: t("navigation.archive"), meta: isAuthenticated ? (isKorean ? "답변 선반" : "Answer shelf") : "Records", to: routeConfig.archive.buildPath(), icon: "archive" as IconName },
          ],
        },
      ]
    : [
        {
          caption: t("sidebar.workspace"),
          items: [
            { label: t("navigation.home"), meta: t("header.guestEyebrow"), to: routeConfig.home.buildPath(), icon: "today" as IconName },
            { label: t("sidebar.questionMap"), meta: t("practice.searchQuestions"), to: routeConfig.practice.buildPath(), icon: "questions" as IconName },
            { label: t("navigation.feed"), meta: isAuthenticated ? "Signals" : "Shared signals", to: routeConfig.feed.buildPath(), icon: "feed" as IconName },
          ],
        },
      ];
  const careerLinks = isAuthenticated
    ? [
        { label: t("navigation.resume"), meta: isAuthenticated ? (isKorean ? "기준 문서" : "Source library") : "Resume", to: routeConfig.resume.buildPath(), icon: "resume" as IconName },
        { label: t("navigation.resumeAnalysis"), meta: t("sidebar.coreLoop"), to: routeConfig.resumeAnalysis.buildPath(), icon: "analysis" as IconName },
        { label: t("navigation.skills"), meta: isAuthenticated ? (isKorean ? "역량 맵" : "Capability map") : "Skills", to: routeConfig.skills.buildPath(), icon: "skills" as IconName },
      ]
    : [
        { label: t("common.login"), meta: t("sidebar.account"), to: routeConfig.login.buildPath(), icon: "login" as IconName },
        { label: t("common.signUp"), meta: t("common.signUp"), to: routeConfig.signup.buildPath(), icon: "signup" as IconName },
      ];
  const manageLinks = isAuthenticated
    ? [
        { label: t("settings.eyebrow"), meta: t("settings.helper"), to: routeConfig.settings.buildPath(), icon: "settings" as IconName },
      ]
    : [];

  return (
    <aside className="sidebar-navigation">
      <div className="sidebar-navigation__brand">
        <div className="sidebar-navigation__brand-row">
          <strong className="sidebar-navigation__title">Iterview</strong>
          <span className="sidebar-navigation__pro-badge">{t("sidebar.brandBadge")}</span>
        </div>
        <p className="sidebar-navigation__summary">{t("sidebar.brandSummary")}</p>
      </div>

      {workspaceLinks.map((section) => (
        <div className="sidebar-navigation__section" key={section.caption}>
          <span className="sidebar-navigation__section-label">{section.caption}</span>
          <nav aria-label={section.caption} className="sidebar-navigation__nav">
            {section.items.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  `sidebar-navigation__link${isActive ? " sidebar-navigation__link--active" : ""}`
                }
                to={link.to}
              >
                <span aria-hidden="true" className="sidebar-navigation__icon">
                  <Icon name={link.icon} />
                </span>
                <span className="sidebar-navigation__link-copy">
                  <strong>{link.label}</strong>
                  <span>{link.meta}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

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
              <span aria-hidden="true" className="sidebar-navigation__icon sidebar-navigation__icon--secondary">
                <Icon name={link.icon} />
              </span>
              <span className="sidebar-navigation__link-copy">
                <strong>{link.label}</strong>
                <span>{link.meta}</span>
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
                <span aria-hidden="true" className="sidebar-navigation__icon sidebar-navigation__icon--secondary">
                  <Icon name={link.icon} />
                </span>
                <span className="sidebar-navigation__link-copy">
                  <strong>{link.label}</strong>
                  <span>{link.meta}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}

      {isAuthenticated ? (
        <section className="sidebar-navigation__progress-card">
          <div className="sidebar-navigation__progress-topline">
            <span className="sidebar-navigation__section-label">{t("sidebar.workflow")}</span>
            <span className="detail-chip detail-chip--accent">{t("sidebar.brandBadge")}</span>
          </div>
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
