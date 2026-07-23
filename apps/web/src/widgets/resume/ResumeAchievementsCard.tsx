import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeAchievementsCardProps = {
  achievements: ResumeSnapshotModel["achievements"];
  sectionId?: string;
};

export function ResumeAchievementsCard({ achievements, sectionId }: ResumeAchievementsCardProps) {
  return (
    <ResumeSectionCard count={achievements.length} eyebrow="Achievements" sectionId={sectionId} title="Impact and outcomes worth defending">
      {achievements.length === 0 ? (
        <p className="page-card__body">No achievement records are available for this version yet.</p>
      ) : (
        <div className="stack-list">
          {achievements.map((achievement) => (
            <article className="list-item-card" key={achievement.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  {achievement.metricText ? <span>{achievement.metricText}</span> : null}
                  {achievement.severityHint ? <span>{achievement.severityHint}</span> : null}
                </div>
                <h3 className="list-item-card__title">{achievement.title}</h3>
                <p className="list-item-card__body">{achievement.impactSummary}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
