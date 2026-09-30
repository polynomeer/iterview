import { Link, useLocation } from "react-router-dom";
import { resolveNavLocation } from "../../shared/config/navigation";
import { useLocale } from "../../shared/i18n";

/** Section links for the current area, e.g. 복습: 지금 복습 · 완료한 질문. */
export function AreaNavigation() {
  const { t } = useLocale();
  const { pathname } = useLocation();
  const { area, section } = resolveNavLocation(pathname);

  if (!area || area.sections.length < 2) {
    return null;
  }

  return (
    <nav aria-label={`${t(area.labelKey)} ${t("nav.areaNavigation")}`} className="shell-area-nav">
      {area.sections.map((candidate) => {
        const isActive = candidate === section;
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className="shell-area-nav__link"
            key={candidate.to}
            to={candidate.to}
          >
            {t(candidate.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
