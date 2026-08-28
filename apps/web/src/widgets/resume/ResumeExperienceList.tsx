import type { ResumeAnalysisModel } from "../../entities/resume/model";
import { InsightCard } from "../../shared/ui/InsightCard";

type ResumeExperienceListProps = {
  experiences: ResumeAnalysisModel["experiences"];
};

export function ResumeExperienceList({ experiences }: ResumeExperienceListProps) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">추출된 경력</p>
          <h2 className="page-card__title">이력서에서 추출한 경력 근거</h2>
        </div>
        <span className="section-heading__count">{experiences.length}</span>
      </div>
      {experiences.length === 0 ? (
        <p className="page-card__body">아직 추출된 경력 정보가 없습니다.</p>
      ) : (
        <div className="stack-list">
          {experiences.map((experience) => (
            <InsightCard
              body={experience.summary}
              key={experience.id}
              label="경력"
              meta={experience.impactText ? [experience.impactText] : []}
              title={experience.title}
            />
          ))}
        </div>
      )}
    </section>
  );
}
