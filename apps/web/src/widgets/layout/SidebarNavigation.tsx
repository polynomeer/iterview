import { NavLink } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useAuth } from "../../shared/auth/useAuth";
import { useLocale } from "../../shared/i18n";

function getNavigationGlyph(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("today") || normalized.includes("오늘")) return "TD";
  if (normalized.includes("workspace") || normalized.includes("인터뷰")) return "WS";
  if (normalized.includes("question") || normalized.includes("질문")) return "QM";
  if (normalized.includes("review") || normalized.includes("복습") || normalized.includes("리뷰")) return "RV";
  if (normalized.includes("schedule") || normalized.includes("예정")) return "SC";
  if (normalized.includes("weak") || normalized.includes("약한")) return "WN";
  if (normalized.includes("archive") || normalized.includes("아카이브")) return "AR";
  if (normalized.includes("resume") || normalized.includes("이력서")) return "CV";
  if (normalized.includes("skill") || normalized.includes("스킬")) return "SK";
  if (normalized.includes("note") || normalized.includes("노트")) return "NT";
  if (normalized.includes("book") || normalized.includes("북마크")) return "BM";
  if (normalized.includes("company") || normalized.includes("기업")) return "TC";
  if (normalized.includes("setting") || normalized.includes("설정")) return "ST";

  return "IT";
}

export function SidebarNavigation() {
  const { isAuthenticated } = useAuth();
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const workspaceLinks = isAuthenticated
    ? [
        {
          caption: t("sidebar.workspace"),
          items: [
            { label: t("header.workspaceTitle"), meta: t("sidebar.brandSummary"), to: routeConfig.interview.buildPath() },
            { label: t("sidebar.today"), meta: t("header.workspaceEyebrow"), to: routeConfig.home.buildPath() },
            { label: t("sidebar.questionMap"), meta: t("practice.searchQuestions"), to: routeConfig.practice.buildPath() },
            { label: t("navigation.reviewQueue"), meta: isAuthenticated ? t("sidebar.workflow") : "Review", to: routeConfig.reviewQueue.buildPath() },
            { label: t("navigation.archive"), meta: isAuthenticated ? (isKorean ? "답변 선반" : "Answer shelf") : "Records", to: routeConfig.archive.buildPath() },
          ],
        },
      ]
    : [
        {
          caption: t("sidebar.workspace"),
          items: [
            { label: t("navigation.home"), meta: t("header.guestEyebrow"), to: routeConfig.home.buildPath() },
            { label: t("sidebar.questionMap"), meta: t("practice.searchQuestions"), to: routeConfig.practice.buildPath() },
            { label: t("navigation.feed"), meta: isAuthenticated ? "Signals" : "Shared signals", to: routeConfig.feed.buildPath() },
          ],
        },
      ];
  const careerLinks = isAuthenticated
    ? [
        { label: t("navigation.resume"), meta: isAuthenticated ? (isKorean ? "기준 문서" : "Source library") : "Resume", to: routeConfig.resume.buildPath() },
        { label: t("navigation.resumeAnalysis"), meta: t("sidebar.coreLoop"), to: routeConfig.resumeAnalysis.buildPath() },
        { label: t("navigation.skills"), meta: isAuthenticated ? (isKorean ? "역량 맵" : "Capability map") : "Skills", to: routeConfig.skills.buildPath() },
      ]
    : [
        { label: t("common.login"), meta: t("sidebar.account"), to: routeConfig.login.buildPath() },
        { label: t("common.signUp"), meta: t("common.signUp"), to: routeConfig.signup.buildPath() },
      ];
  const manageLinks = isAuthenticated
    ? [
        { label: t("settings.eyebrow"), meta: t("settings.helper"), to: routeConfig.settings.buildPath() },
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
                  {getNavigationGlyph(link.label)}
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
                {getNavigationGlyph(link.label)}
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
                  {getNavigationGlyph(link.label)}
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
