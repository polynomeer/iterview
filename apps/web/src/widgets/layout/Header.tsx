import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useAuth } from "../../shared/auth/useAuth";
import { useLogout } from "../../features/auth/useLogout";
import { useLocale } from "../../shared/i18n";

function getInitials(label: string) {
  return label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function Header() {
  const { isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();
  const logout = useLogout();
  const { t } = useLocale();
  const currentUser = currentUserQuery.data;
  const displayName =
    currentUser?.profile?.nickname?.trim() ||
    currentUser?.nickname?.trim() ||
    currentUser?.name ||
    currentUser?.email;
  const profileMeta =
    currentUser?.profile?.jobRole?.trim() ||
    currentUser?.jobRole?.trim() ||
    "Interview profile";
  const profileImageUrl = currentUser?.profile?.profileImageUrl?.trim() ?? "";
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div>
          <span className="app-header__eyebrow">Interview Workspace</span>
          <strong className="app-header__title">Interview Workspace</strong>
        </div>
      </div>
      <div className="app-header__search">
        <input
          aria-label="Search workspace"
          className="app-header__search-input"
          placeholder="Search (⌘K)"
          type="search"
        />
      </div>
      <div className="app-header__actions">
        {isAuthenticated && currentUser ? (
          <>
            <button className="app-header__icon-action" type="button">
              ⌂
            </button>
            <button className="app-header__icon-action" type="button">
              ○
            </button>
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
            <button className="app-header__action app-header__action--secondary" onClick={logout} type="button">
              {t("common.logout")}
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
