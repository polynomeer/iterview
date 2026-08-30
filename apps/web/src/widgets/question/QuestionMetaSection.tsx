import type { QuestionDetailModel } from "../../entities/question/model";
import { useLocale } from "../../shared/i18n";

type QuestionMetaSectionProps = {
  question: QuestionDetailModel;
};

export function QuestionMetaSection({ question }: QuestionMetaSectionProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card question-detail-section-card question-detail-section-card--inspector">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "메타데이터" : "Metadata"}</p>
          <h2 className="page-card__title">{isKorean ? "이 질문 문구의 맥락" : "Context for this prompt"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "이 레일을 사용해 답변이 카테고리, 회사, 역할 제약에 맞게 구체적으로 유지되도록 하세요."
              : "Use this rail to keep the answer specific to category, company, and role constraints."}
          </p>
        </div>
      </div>
      <div className="stats-grid">
        <article className="stat-tile">
          <p className="stat-tile__label">{isKorean ? "카테고리" : "Category"}</p>
          <strong className="stat-tile__value stat-tile__value--small">{question.category}</strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">{isKorean ? "난이도" : "Difficulty"}</p>
          <strong className="stat-tile__value stat-tile__value--small">{question.difficulty}</strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">{isKorean ? "회사 수" : "Companies"}</p>
          <strong className="stat-tile__value stat-tile__value--small">{question.companies.length}</strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">{isKorean ? "자료 수" : "Materials"}</p>
          <strong className="stat-tile__value stat-tile__value--small">{question.learningMaterials.length}</strong>
        </article>
      </div>
      <div className="question-detail-section-card__supporting">
        <article className="question-detail-section-card__supporting-item">
          <span>{isKorean ? "태그 밀도" : "Tag density"}</span>
          <strong>{question.tags.length}</strong>
        </article>
        <article className="question-detail-section-card__supporting-item">
          <span>{isKorean ? "스킬 앵커" : "Skill anchors"}</span>
          <strong>{(question.relatedSkills ?? []).length}</strong>
        </article>
      </div>
      <div className="detail-chip-section">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "태그" : "Tags"}</p>
          <div className="chip-list">
            {question.tags.map((tag) => (
              <span className="detail-chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "관련 회사" : "Related companies"}</p>
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
            <p className="section-heading__eyebrow">{isKorean ? "역할" : "Roles"}</p>
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
            <p className="section-heading__eyebrow">{isKorean ? "관련 스킬" : "Related skills"}</p>
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
