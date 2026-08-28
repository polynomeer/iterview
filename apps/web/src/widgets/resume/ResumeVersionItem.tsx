import type { ResumeVersionModel } from "../../entities/resume/model";

type ResumeVersionItemProps = {
  version: ResumeVersionModel;
  onSelect: () => void;
  isSelected: boolean;
};

export function ResumeVersionItem({
  version,
  onSelect,
  isSelected,
}: ResumeVersionItemProps) {
  return (
    <article
      className={`list-item-card ${isSelected ? "list-item-card--selected" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="list-item-card__content">
        <div className="list-item-card__meta">
          <span>{version.versionNumberLabel}</span>
          {version.uploadedAtLabel ? <span>{version.uploadedAtLabel}</span> : null}
          {version.isActive ? (
            <span className="question-status-badge question-status-badge--positive">활성</span>
          ) : null}
          <span className={`question-status-badge question-status-badge--${version.parsingTone}`}>
            {version.parsingStatusLabel}
          </span>
          <span className={`question-status-badge question-status-badge--${version.extractionTone}`}>
            추출: {version.extractionStatusLabel}
          </span>
        </div>
        <h3 className="list-item-card__title">{version.fileNameLabel}</h3>
        {version.parseErrorMessage ? (
          <p className="list-item-card__body list-item-card__body--danger">{version.parseErrorMessage}</p>
        ) : version.extractionErrorMessage ? (
          <p className="list-item-card__body list-item-card__body--warning">{version.extractionErrorMessage}</p>
        ) : null}
        <p className="list-item-card__helper">
          {isSelected ? "아래에서 확인 중" : "선택해서 이 버전을 확인하고 관리하세요"}
        </p>
      </div>
    </article>
  );
}
