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
            <article className="list-item-card resume-competency-card" key={competency.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>역량 근거</span>
                  {competency.sourceRecordId ? <span>{`기록 ${competency.sourceRecordId}`}</span> : null}
                  {competency.sourceText ? <span>{`출처 ${competency.sourceText}`}</span> : null}
                </div>
                <h3 className="list-item-card__title">{competency.title}</h3>
                <p className="list-item-card__body resume-section__body--preserve">{competency.description}</p>
              </div>
              {competency.sourceText ? (
                <div className="list-item-card__actions">
                  <span className="question-status-badge question-status-badge--neutral">문장 근거 확인됨</span>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
