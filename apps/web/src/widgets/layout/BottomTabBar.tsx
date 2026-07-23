import { NavLink } from "react-router-dom";
import { tabRoutes } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

const tabIcons: Record<string, string> = {
  "/": "⌂",
  "/practice": "◫",
  "/archive": "✓",
  "/feed": "≈",
  "/profile": "◌",
};

export function BottomTabBar() {
  const { t } = useLocale();

  function getRouteLabel(path: string) {
    switch (path) {
      case "/":
        return t("navigation.home");
      case "/practice":
        return t("navigation.practice");
      case "/archive":
        return t("navigation.archive");
      case "/feed":
        return t("navigation.feed");
      case "/profile":
        return t("navigation.profile");
      default:
        return path;
    }
  }

  return (
    <nav aria-label="Primary" className="bottom-tab-bar">
      {tabRoutes.map((route) => (
        <NavLink
          key={route.path}
          className={({ isActive }) =>
            `bottom-tab-bar__link${isActive ? " bottom-tab-bar__link--active" : ""}`
          }
          to={route.buildPath()}
        >
          <span aria-hidden="true" className="bottom-tab-bar__icon">
            {tabIcons[route.path]}
          </span>
          <span>{getRouteLabel(route.path)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
