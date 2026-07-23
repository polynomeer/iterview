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
          <p className="section-heading__eyebrow">Parsed experiences</p>
          <h2 className="page-card__title">Experience evidence extracted from your resume</h2>
        </div>
        <span className="section-heading__count">{experiences.length}</span>
      </div>
      {experiences.length === 0 ? (
        <p className="page-card__body">No extracted experiences are available yet.</p>
      ) : (
        <div className="stack-list">
          {experiences.map((experience) => (
            <InsightCard
              body={experience.summary}
              key={experience.id}
              label="Experience"
              meta={experience.impactText ? [experience.impactText] : []}
              title={experience.title}
            />
          ))}
        </div>
      )}
    </section>
  );
}
