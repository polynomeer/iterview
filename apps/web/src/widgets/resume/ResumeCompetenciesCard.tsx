import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeCompetenciesCardProps = {
  competencies: ResumeSnapshotModel["competencies"];
  sectionId?: string;
};

export function ResumeCompetenciesCard({ competencies, sectionId }: ResumeCompetenciesCardProps) {
  return (
    <ResumeSectionCard count={competencies.length} eyebrow="Competencies" sectionId={sectionId} title="Long-form competency statements">
      {competencies.length === 0 ? (
        <p className="page-card__body">No competency statements were extracted for this version yet.</p>
      ) : (
        <div className="stack-list">
          {competencies.map((competency) => (
            <article className="page-card page-card--muted" key={competency.id}>
              <span className="page-card__label">Competency</span>
              <h3 className="page-card__title">{competency.title}</h3>
              <p className="page-card__body resume-section__body--preserve">{competency.description}</p>
              {competency.sourceText ? (
                <p className="resume-section__helper">Source: {competency.sourceText}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
