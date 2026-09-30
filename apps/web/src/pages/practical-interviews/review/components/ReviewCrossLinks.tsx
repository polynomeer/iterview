import { Link } from "react-router-dom";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";

export function ReviewCrossLinks() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card">
      <span className="page-card__label">{isKorean ? "교차 링크" : "Cross-links"}</span>
      <h2 className="page-card__title">{isKorean ? "기존 질문과 아카이브 흐름을 유지하세요" : "Keep existing question and archive flows"}</h2>
      <div className="page-card__actions">
        <Link className="secondary-button" to={routeConfig.practicalInterviews.buildPath()}>
          {isKorean ? "기록 목록으로" : "Back to records"}
        </Link>
        <Link className="secondary-button" to={routeConfig.archive.buildPath()}>
          {isKorean ? "아카이브 열기" : "Open archive"}
        </Link>
        <Link className="secondary-button" to={routeConfig.interview.buildPath()}>
          {isKorean ? "면접 기록 열기" : "Open interview history"}
        </Link>
      </div>
    </section>
  );
}
