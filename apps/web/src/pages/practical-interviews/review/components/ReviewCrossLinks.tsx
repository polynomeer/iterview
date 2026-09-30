import { Link } from "react-router-dom";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";

export function ReviewCrossLinks() {
  const { t } = useLocale();

  return (
    <section className="page-card">
      <span className="page-card__label">{t("practicalReview.crossLinks")}</span>
      <h2 className="page-card__title">{t("practicalReview.keepExistingQuestionArchive")}</h2>
      <div className="page-card__actions">
        <Link className="secondary-button" to={routeConfig.practicalInterviews.buildPath()}>
          {t("practicalReview.backRecords")}
        </Link>
        <Link className="secondary-button" to={routeConfig.archive.buildPath()}>
          {t("practicalReview.openArchive")}
        </Link>
        <Link className="secondary-button" to={routeConfig.interview.buildPath()}>
          {t("practicalReview.openInterviewHistory")}
        </Link>
      </div>
    </section>
  );
}
