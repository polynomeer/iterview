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

/** 설정: profile, target companies, practice goals, language and display, and account in one page (docs/09 §4.4). */
export function SettingsPage() {
  const { t } = useLocale();
  const currentUserQuery = useCurrentUserQuery();

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
            <a href={`#${id}`} key={id}>
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
