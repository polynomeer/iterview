import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeCompetenciesCardProps = {
  competencies: ResumeSnapshotModel["competencies"];
  sectionId?: string;
};

export function ResumeCompetenciesCard({ competencies, sectionId }: ResumeCompetenciesCardProps) {
  return (
    <ResumeSectionCard count={competencies.length} eyebrow="역량" sectionId={sectionId} title="길게 풀어쓴 핵심 역량">
      {competencies.length === 0 ? (
        <p className="page-card__body">아직 이 버전에서 역량 문장이 추출되지 않았습니다.</p>
      ) : (
        <div className="stack-list">
          {competencies.map((competency) => (
            <article className="page-card page-card--muted" key={competency.id}>
              <span className="page-card__label">역량</span>
              <h3 className="page-card__title">{competency.title}</h3>
              <p className="page-card__body resume-section__body--preserve">{competency.description}</p>
              {competency.sourceText ? (
                <p className="resume-section__helper">출처: {competency.sourceText}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
