import { Link, useLocation } from "react-router-dom";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { useAuth } from "../../shared/auth/useAuth";
import { PRIMARY_AREAS, resolveNavLocation, SETTINGS_AREA, type NavArea } from "../../shared/config/navigation";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Icon, type IconName } from "../../shared/ui/primitives";

type NavItemProps = {
  to: string;
  icon: IconName;
  label: string;
  isActive: boolean;
  badge?: { count: number; label: string };
};

function NavItem({ to, icon, label, isActive, badge }: NavItemProps) {
  return (
    <Link aria-current={isActive ? "page" : undefined} className="shell-nav__item" to={to}>
      <Icon name={icon} />
      <span className="shell-nav__label">{label}</span>
      {badge && badge.count > 0 ? (
        <span aria-label={badge.label} className="shell-nav__count">
          {badge.count}
        </span>
      ) : null}
    </Link>
  );
}

function ActiveResumeCard() {
  const { t } = useLocale();
  const latestResumeQuery = useLatestResumeQuery();
  const resume = latestResumeQuery.data?.items[0];
  const activeVersion = resume?.versions.find((version) => version.isActive) ?? resume?.versions[0];

  if (latestResumeQuery.isLoading) {
    return null;
  }

  return (
    <Link className="shell-nav__resume" to={routeConfig.resume.buildPath()}>
      <Icon name="resume" />
      <span className="shell-nav__resume-copy">
        <span className="shell-nav__resume-label">{t("nav.activeResume")}</span>
        <strong>{resume ? resume.title : t("nav.noActiveResume")}</strong>
        <span className="shell-nav__resume-meta">
          {activeVersion ? `${activeVersion.versionNumberLabel} · ${activeVersion.parsingStatusLabel}` : t("nav.uploadResume")}
        </span>
      </span>
      <Icon name="chevronRight" size={16} />
    </Link>
  );
}

export function SidebarNavigation() {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();
  const { pathname } = useLocation();
  const activeArea = resolveNavLocation(pathname).area;
  const reviewQueueQuery = useReviewQueueQuery({ enabled: isAuthenticated });
  const reviewCount = reviewQueueQuery.data?.items.length ?? 0;

  const areaItem = (area: NavArea) => (
    <NavItem
      badge={
        area.id === "review"
          ? { count: reviewCount, label: t("nav.reviewDueCount").replace("{count}", String(reviewCount)) }
          : undefined
      }
      icon={area.icon}
      isActive={activeArea?.id === area.id}
      key={area.id}
      label={t(area.labelKey)}
      to={area.to}
    />
  );

  return (
    <aside className="sidebar-navigation shell-nav">
      <Link className="shell-nav__brand" to={routeConfig.home.buildPath()}>
        <span aria-hidden="true" className="shell-nav__brand-mark">
          i
        </span>
        iterview
      </Link>

      <nav aria-label={t("nav.primaryNavigation")} className="shell-nav__group">
        {isAuthenticated ? (
          PRIMARY_AREAS.map(areaItem)
        ) : (
          <>
            {PRIMARY_AREAS.filter((area) => area.id === "today" || area.id === "questions").map(areaItem)}
            <NavItem
              icon="feed"
              isActive={pathname === routeConfig.feed.buildPath()}
              label={t("nav.explore")}
              to={routeConfig.feed.buildPath()}
            />
          </>
        )}
      </nav>

      <div className="shell-nav__footer">
        {isAuthenticated ? (
          <>
            <ActiveResumeCard />
            {areaItem(SETTINGS_AREA)}
          </>
        ) : (
          <>
            <NavItem icon="login" isActive={pathname === routeConfig.login.buildPath()} label={t("common.login")} to={routeConfig.login.buildPath()} />
            <NavItem icon="signup" isActive={pathname === routeConfig.signup.buildPath()} label={t("common.signUp")} to={routeConfig.signup.buildPath()} />
          </>
        )}
      </div>
    </aside>
  );
}
