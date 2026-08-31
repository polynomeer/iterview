import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeAchievementsCardProps = {
  achievements: ResumeSnapshotModel["achievements"];
  sectionId?: string;
};

export function ResumeAchievementsCard({ achievements, sectionId }: ResumeAchievementsCardProps) {
  return (
    <ResumeSectionCard count={achievements.length} eyebrow="성과" sectionId={sectionId} title="면접에서 방어해야 할 임팩트와 결과">
      {achievements.length === 0 ? (
        <p className="page-card__body">아직 이 버전의 성과 기록이 없습니다.</p>
      ) : (
        <div className="stack-list">
          {achievements.map((achievement) => (
            <article className="list-item-card resume-achievement-card" key={achievement.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>성과</span>
                  {achievement.metricText ? <span>{achievement.metricText}</span> : null}
                  {achievement.severityHint ? <span>{achievement.severityHint}</span> : null}
                </div>
                <h3 className="list-item-card__title">{achievement.title}</h3>
                <p className="list-item-card__body">{achievement.impactSummary}</p>
              </div>
              <div className="list-item-card__actions">
                <span className={`question-status-badge question-status-badge--${achievement.metricText ? "accent" : "neutral"}`}>
                  {achievement.metricText ? "수치 근거 포함" : "서술형 성과"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
