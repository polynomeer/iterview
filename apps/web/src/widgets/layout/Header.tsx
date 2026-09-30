import { Link, useLocation } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useAuth } from "../../shared/auth/useAuth";
import { useLogout } from "../../features/auth/useLogout";
import { useLocale, type AppLocale } from "../../shared/i18n";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { Icon } from "../../shared/ui/primitives";
import { resolveHeaderTitleKey } from "./headerTitles";

type HeaderProps = {
  onOpenCommandPalette?: () => void;
};

function getInitials(label: string) {
  return label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const currentUserQuery = useCurrentUserQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const logout = useLogout();
  const { locale, setLocale, t } = useLocale();
  const currentUser = currentUserQuery.data;
  const displayName =
    currentUser?.profile?.nickname?.trim() ||
    currentUser?.nickname?.trim() ||
    currentUser?.name ||
    currentUser?.email;
  const profileMeta =
    currentUser?.profile?.jobRole?.trim() ||
    currentUser?.jobRole?.trim() ||
    t("navigation.profile");
  const profileImageUrl = currentUser?.profile?.profileImageUrl?.trim() ?? "";
  const pageHeader = isAuthenticated
    ? { eyebrow: t("header.workspaceEyebrow"), title: t(resolveHeaderTitleKey(location.pathname)) }
    : { eyebrow: t("header.guestEyebrow"), title: t("header.guestTitle") };

  async function handleLocaleChange(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      return;
    }

    if (!isAuthenticated || !currentUser) {
      setLocale(nextLocale);
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        preferredLanguage: nextLocale,
      });
      setLocale(nextLocale);
    } catch {
      return;
    }
  }

  return (
    <header className={`app-header${isAuthenticated ? "" : " app-header--guest"}`}>
      <div className="app-header__brand">
        <div>
          <span className="app-header__eyebrow">{pageHeader.eyebrow}</span>
          <strong className="app-header__title">{pageHeader.title}</strong>
        </div>
      </div>
      {isAuthenticated ? (
        <div className="app-header__search">
          <button
            aria-label={t("header.openCommandPalette")}
            className="app-header__search-trigger"
            onClick={onOpenCommandPalette}
            type="button"
          >
            <span className="app-header__search-placeholder">{t("header.searchPlaceholder")}</span>
            <span aria-hidden="true" className="app-header__search-shortcut">
              ⌘K
            </span>
          </button>
        </div>
      ) : null}
      <div className="app-header__actions">
        <div aria-label={t("header.languageToggleLabel")} className="app-header__locale-switch" role="group">
          {(["ko", "en"] as const).map((option) => (
            <button
              aria-pressed={locale === option}
              className={`app-header__locale-option${locale === option ? " app-header__locale-option--active" : ""}`}
              disabled={updateSettingsMutation.isPending}
              key={option}
              onClick={() => {
                void handleLocaleChange(option);
              }}
              type="button"
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
        {isAuthenticated && currentUser ? (
          <>
            <Link className="app-header__action" to={routeConfig.profile.buildPath()}>
              <span className="app-header__avatar" aria-hidden="true">
                {profileImageUrl ? (
                  <img
                    alt=""
                    className="app-header__avatar-image"
                    src={profileImageUrl}
                  />
                ) : (
                  <span className="app-header__avatar-fallback">
                    {getInitials(displayName || currentUser.email || "IU")}
                  </span>
                )}
              </span>
              <span className="app-header__action-copy">
                <strong>{displayName}</strong>
                <span className="app-header__action-meta">{profileMeta}</span>
              </span>
            </Link>
            <button
              aria-label={t("common.logout")}
              className="app-header__icon-action"
              onClick={logout}
              title={t("common.logout")}
              type="button"
            >
              <Icon name="logout" />
            </button>
          </>
        ) : (
          <>
            <Link className="app-header__action app-header__action--secondary" to={routeConfig.login.buildPath()}>
              {t("common.login")}
            </Link>
            <Link className="app-header__action" to={routeConfig.signup.buildPath()}>
              {t("common.signUp")}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
