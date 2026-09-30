import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { useAuth } from "../../shared/auth/useAuth";
import { PRIMARY_AREAS, resolveNavLocation, SETTINGS_AREA, type NavArea } from "../../shared/config/navigation";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { parsingStatusLabel } from "../../shared/lib/labels";
import { Icon, type IconName } from "../../shared/ui/primitives";
import { ResumeVersionSwitcher } from "./ResumeVersionSwitcher";

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

/** Version-scoped resume pages follow the switch: /resume/3/heatmap → /resume/7/heatmap. */
export function followVersion(pathname: string, versionId: string) {
  const match = pathname.match(/^\/resume\/([^/]+)(?:\/(claims|heatmap|tailor|versions)(?:\/.*)?)?\/?$/);
  if (!match || match[1] === "analysis" || match[1] === "tailor") {
    return null;
  }
  // Anchors and analyses belong to the old version, so land on the tab itself.
  return match[2] ? `/resume/${versionId}/${match[2]}` : `/resume/${versionId}`;
}

function ActiveResumeCard() {
  const { t, locale } = useLocale();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { active, resumes, isLoading } = useActiveResumeVersion();
  const [open, setOpen] = useState(false);
  const hasVersions = resumes.some((resume) => resume.versions.length > 0);

  if (isLoading) {
    return null;
  }

  if (!hasVersions) {
    return (
      <Link className="shell-nav__resume" to={routeConfig.resume.buildPath()}>
        <Icon name="resume" />
        <span className="shell-nav__resume-copy">
          <span className="shell-nav__resume-label">{t("nav.activeResume")}</span>
          <strong>{t("nav.noActiveResume")}</strong>
          <span className="shell-nav__resume-meta">{t("nav.uploadResume")}</span>
        </span>
        <Icon name="chevronRight" size={16} />
      </Link>
    );
  }

  const status = active ? parsingStatusLabel(active.parsingStatus, locale) : null;

  return (
    <>
      <button aria-haspopup="dialog" className="shell-nav__resume" onClick={() => setOpen(true)} type="button">
        <Icon name="resume" />
        <span className="shell-nav__resume-copy">
          <span className="shell-nav__resume-label">{t("nav.activeResume")}</span>
          <strong>{active ? active.resumeTitle : t("nav.noActiveResume")}</strong>
          <span className="shell-nav__resume-meta">{active && status ? `${active.versionNumberLabel} · ${status.label}` : t("nav.chooseVersion")}</span>
        </span>
        <Icon name="chevronDown" size={16} />
      </button>
      <ResumeVersionSwitcher
        onActivated={(versionId) => {
          const next = followVersion(pathname, versionId);
          if (next) {
            navigate(next);
          }
        }}
        onClose={() => setOpen(false)}
        open={open}
      />
    </>
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
