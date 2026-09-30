import { Link, useLocation } from "react-router-dom";
import { PRIMARY_AREAS, resolveNavLocation } from "../../shared/config/navigation";
import { useLocale } from "../../shared/i18n";
import { Icon } from "../../shared/ui/primitives";

export function BottomTabBar() {
  const { t } = useLocale();
  const { pathname } = useLocation();
  const activeArea = resolveNavLocation(pathname).area;

  return (
    <nav aria-label={t("nav.primaryNavigation")} className="bottom-tab-bar">
      {PRIMARY_AREAS.map((area) => {
        const isActive = activeArea?.id === area.id;
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`bottom-tab-bar__link${isActive ? " bottom-tab-bar__link--active" : ""}`}
            key={area.id}
            to={area.to}
          >
            <span aria-hidden="true" className="bottom-tab-bar__icon">
              <Icon name={area.icon} size={20} />
            </span>
            <span>{t(area.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
