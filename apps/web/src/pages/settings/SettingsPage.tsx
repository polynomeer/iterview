import { useEffect, useState } from "react";
import { mapCurrentUserDtoToProfileModel } from "../../entities/profile/model";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { Button, ErrorState, PageHeader, PageSkeleton } from "../../shared/ui/primitives";
import { AccountSection, DisplaySection, PracticeSection, ProfileSection, TargetCompaniesSection } from "./settingsSections";
import "./settings.css";

const SECTIONS: Array<[id: string, label: MessageKey]> = [
  ["profile", "settingsPage.profileTitle"],
  ["target-companies", "settingsPage.targetsTitle"],
  ["practice", "settingsPage.practiceTitle"],
  ["display", "settingsPage.displayTitle"],
  ["account", "settingsPage.accountTitle"],
];

/** Marks the section nearest the top of the viewport; a click marks its target right away. */
function useActiveSection(ready: boolean) {
  const [active, setActive] = useState(SECTIONS[0][0]);

  useEffect(() => {
    if (!ready || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px" },
    );
    SECTIONS.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, [ready]);

  return [active, setActive] as const;
}

/** 설정: profile, target companies, practice goals, language and display, and account in one page (docs/09 §4.4). */
export function SettingsPage() {
  const { t } = useLocale();
  const currentUserQuery = useCurrentUserQuery();
  const [activeSection, setActiveSection] = useActiveSection(Boolean(currentUserQuery.data));

  if (currentUserQuery.isLoading) {
    return <PageSkeleton label={t("settingsPage.loading")} />;
  }

  if (currentUserQuery.isError || !currentUserQuery.data) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void currentUserQuery.refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(currentUserQuery.error, t("settingsPage.loadErrorBody"))}
        details={getErrorDetails(currentUserQuery.error)}
        size="page"
        title={t("settingsPage.loadErrorTitle")}
      />
    );
  }

  const profile = mapCurrentUserDtoToProfileModel(currentUserQuery.data);

  return (
    <div className="ui-page">
      <PageHeader description={t("settingsPage.pageDescription")} title={t("settingsPage.pageTitle")} />
      <div className="settings-grid">
        <nav aria-label={t("settingsPage.sectionNav")} className="settings-nav">
          {SECTIONS.map(([id, label]) => (
            <a aria-current={activeSection === id ? "location" : undefined} href={`#${id}`} key={id} onClick={() => setActiveSection(id)}>
              {t(label)}
            </a>
          ))}
        </nav>
        <div className="settings-sections">
          <ProfileSection key={`profile-${profile.id}`} profile={profile} />
          <TargetCompaniesSection companies={profile.targetCompanies} />
          <PracticeSection key={`practice-${profile.id}`} profile={profile} />
          <DisplaySection />
          <AccountSection email={profile.email} />
        </div>
      </div>
    </div>
  );
}
