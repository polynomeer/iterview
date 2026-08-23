import type { QuestionDetailModel } from "../../entities/question/model";

type QuestionMetaSectionProps = {
  question: QuestionDetailModel;
};

export function QuestionMetaSection({ question }: QuestionMetaSectionProps) {
  return (
    <section className="page-card question-detail-section-card question-detail-section-card--inspector">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Metadata</p>
          <h2 className="page-card__title">Context for this prompt</h2>
          <p className="page-card__body">
            Use this rail to keep the answer specific to category, company, and role constraints.
          </p>
        </div>
      </div>
      <div className="stats-grid">
        <article className="stat-tile">
          <p className="stat-tile__label">Category</p>
          <strong className="stat-tile__value stat-tile__value--small">{question.category}</strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">Difficulty</p>
          <strong className="stat-tile__value stat-tile__value--small">{question.difficulty}</strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">Companies</p>
          <strong className="stat-tile__value stat-tile__value--small">{question.companies.length}</strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">Materials</p>
          <strong className="stat-tile__value stat-tile__value--small">{question.learningMaterials.length}</strong>
        </article>
      </div>
      <div className="question-detail-section-card__supporting">
        <article className="question-detail-section-card__supporting-item">
          <span>Tag density</span>
          <strong>{question.tags.length}</strong>
        </article>
        <article className="question-detail-section-card__supporting-item">
          <span>Skill anchors</span>
          <strong>{(question.relatedSkills ?? []).length}</strong>
        </article>
      </div>
      <div className="detail-chip-section">
        <div>
          <p className="section-heading__eyebrow">Tags</p>
          <div className="chip-list">
            {question.tags.map((tag) => (
              <span className="detail-chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="section-heading__eyebrow">Related companies</p>
          <div className="chip-list">
            {question.companies.map((company) => (
              <span className="detail-chip detail-chip--accent" key={company}>
                {company}
              </span>
            ))}
          </div>
        </div>
        {(question.roles ?? []).length > 0 ? (
          <div>
            <p className="section-heading__eyebrow">Roles</p>
            <div className="chip-list">
              {(question.roles ?? []).map((role) => (
                <span className="detail-chip" key={role}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {(question.relatedSkills ?? []).length > 0 ? (
          <div>
            <p className="section-heading__eyebrow">Related skills</p>
            <div className="chip-list">
              {(question.relatedSkills ?? []).map((skill) => (
                <span className="detail-chip detail-chip--accent" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
