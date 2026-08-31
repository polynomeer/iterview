import { Link } from "react-router-dom";
import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";

type QuestionListItemProps = {
  item: PracticeQuestionItemModel;
  isSelected?: boolean;
  onSelect?: () => void;
};

function getScoreLabel(item: PracticeQuestionItemModel) {
  const candidate = item.progressSummaryLabel ?? item.resumeRelevanceLabel ?? "";
  const match = candidate.match(/(\d+)/);

  return match ? `${match[1]}%` : "미정";
}

export function QuestionListItem({
  item,
  isSelected = false,
  onSelect,
}: QuestionListItemProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <article
      className={`list-item-card practice-list-item-card practice-browser-row ${isSelected ? "practice-browser-row--selected" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div aria-hidden="true" className="practice-browser-row__icon">
        <span>{item.categoryLabel.slice(0, 2)}</span>
      </div>
      <div className="practice-browser-row__main">
        <div className="practice-browser-row__topline">
          <h3 className="list-item-card__title">{item.title}</h3>
          <div className="practice-browser-row__pills">
            <span className="list-item-card__meta-pill">{item.companyLabel}</span>
            <span className="list-item-card__meta-pill">{item.difficultyLabel}</span>
            {item.statusLabel ? <QuestionStatusBadge status={item.statusLabel.toLowerCase()} /> : null}
          </div>
        </div>
        <div className="list-item-card__meta practice-browser-row__meta" role="list">
          <span className="list-item-card__meta-pill" role="listitem">{item.categoryLabel}</span>
          {(item.relatedSkillLabels ?? []).slice(0, 2).map((skill) => (
            <span className="list-item-card__meta-pill" key={skill} role="listitem">{skill}</span>
          ))}
        </div>
        <p className="list-item-card__body practice-browser-row__body">{item.prompt}</p>
      </div>
      <div className="practice-browser-row__metric">
        <span>{isKorean ? "숙련도" : "Mastery"}</span>
        <strong>{getScoreLabel(item)}</strong>
      </div>
      <div className="practice-browser-row__metric">
        <span>{isKorean ? "최근 기록" : "Last attempt"}</span>
        <strong>{item.progressSummaryLabel ?? (isKorean ? "기록 없음" : "No record")}</strong>
      </div>
      <div className="practice-browser-row__actions">
        <Link
          className="secondary-button"
          onClick={(event) => event.stopPropagation()}
          to={routeConfig.questionDetail.buildPath({ questionId: item.id })}
        >
          {isKorean ? "상세" : "Detail"}
        </Link>
        <Link
          className="primary-button"
          onClick={(event) => event.stopPropagation()}
          to={routeConfig.answerEditor.buildPath({ questionId: item.id })}
        >
          {isKorean ? "시작" : "Start"}
        </Link>
      </div>
    </article>
  );
}
