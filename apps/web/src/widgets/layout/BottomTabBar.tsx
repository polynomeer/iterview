import { NavLink } from "react-router-dom";
import { tabRoutes } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

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
    <nav aria-label={t("sidebar.workspace")} className="bottom-tab-bar">
      {tabRoutes.map((route, index) => (
        <NavLink
          key={route.path}
          className={({ isActive }) =>
            `bottom-tab-bar__link${isActive ? " bottom-tab-bar__link--active" : ""}`
          }
          to={route.buildPath()}
        >
          <span aria-hidden="true" className="bottom-tab-bar__icon">
            {(index + 1).toString().padStart(2, "0")}
          </span>
          <span>{getRouteLabel(route.path)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
