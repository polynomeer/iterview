import { Link, NavLink, useLocation } from "react-router-dom";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLogout } from "../../features/auth/useLogout";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { useAuth } from "../../shared/auth/useAuth";
import { resolveNavLocation } from "../../shared/config/navigation";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type AppLocale } from "../../shared/i18n";
import { ButtonLink, Icon, IconButton } from "../../shared/ui/primitives";
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
  const { pathname } = useLocation();
  const currentUserQuery = useCurrentUserQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const logout = useLogout();
  const { locale, setLocale, t } = useLocale();
  const currentUser = currentUserQuery.data;
  const displayName =
    currentUser?.profile?.nickname?.trim() || currentUser?.nickname?.trim() || currentUser?.name || currentUser?.email;
  const profileImageUrl = currentUser?.profile?.profileImageUrl?.trim() ?? "";
  const { area } = resolveNavLocation(pathname);
  const pageTitle = t(resolveHeaderTitleKey(pathname));
  const areaTitle = area ? t(area.labelKey) : null;

  async function handleLocaleChange(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      return;
    }

    if (!isAuthenticated || !currentUser) {
      setLocale(nextLocale);
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({ preferredLanguage: nextLocale });
      setLocale(nextLocale);
    } catch {
      return;
    }
  }

  return (
    <header className="shell-topbar">
      <nav aria-label={t("header.breadcrumbLabel")} className="shell-topbar__breadcrumb">
        {area && areaTitle !== pageTitle ? (
          <>
            <Link className="shell-topbar__crumb" to={area.to}>
              {areaTitle}
            </Link>
            <Icon className="shell-topbar__separator" name="chevronRight" size={14} />
          </>
        ) : null}
        {/* Pages own the h1; the top bar only reflects location. */}
        <span aria-current="page" className="shell-topbar__title">
          {pageTitle}
        </span>
      </nav>

      {isAuthenticated ? (
        <button
          aria-keyshortcuts="Meta+K Control+K"
          aria-label={t("header.openCommandPalette")}
          className="shell-topbar__search"
          onClick={onOpenCommandPalette}
          type="button"
        >
          <Icon name="search" size={16} />
          <span className="shell-topbar__search-placeholder">{t("header.searchPlaceholder")}</span>
          <kbd aria-hidden="true" className="shell-topbar__kbd">
            ⌘K
          </kbd>
        </button>
      ) : null}

      <div className="shell-topbar__actions">
        <div aria-label={t("header.languageToggleLabel")} className="shell-topbar__locale" role="group">
          {(["ko", "en"] as const).map((option) => (
            <button
              aria-pressed={locale === option}
              className="shell-topbar__locale-option"
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
            {/* The sidebar holds 보관함 on desktop; the mobile tab bar only fits the five areas. */}
            <NavLink aria-label={t("nav.library")} className="shell-topbar__library" title={t("nav.library")} to={routeConfig.library.buildPath()}>
              <Icon name="bookmark" size={18} />
            </NavLink>
            <Link
              aria-label={`${t("nav.profile")} · ${displayName ?? ""}`}
              className="shell-topbar__avatar"
              title={displayName}
              to={routeConfig.profile.buildPath()}
            >
              {profileImageUrl ? (
                <img alt="" src={profileImageUrl} />
              ) : (
                <span aria-hidden="true">{getInitials(displayName || currentUser.email || "IU")}</span>
              )}
            </Link>
            <IconButton icon="logout" label={t("common.logout")} onClick={logout} />
          </>
        ) : (
          <>
            <ButtonLink size="sm" to={routeConfig.login.buildPath()} variant="ghost">
              {t("common.login")}
            </ButtonLink>
            <ButtonLink size="sm" to={routeConfig.signup.buildPath()} variant="primary">
              {t("common.signUp")}
            </ButtonLink>
          </>
        )}
      </div>
    </header>
  );
}
