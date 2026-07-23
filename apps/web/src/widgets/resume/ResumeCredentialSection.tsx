import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeCredentialSectionProps = {
  sectionId?: string;
  eyebrow: string;
  title: string;
  emptyMessage: string;
  items: Array<{
    id: string;
    title: string;
    meta: string[];
    body?: string;
  }>;
};

export function ResumeCredentialSection({
  sectionId,
  eyebrow,
  title,
  emptyMessage,
  items,
}: ResumeCredentialSectionProps) {
  return (
    <ResumeSectionCard count={items.length} eyebrow={eyebrow} sectionId={sectionId} title={title}>
      {items.length === 0 ? (
        <p className="page-card__body">{emptyMessage}</p>
      ) : (
        <div className="stack-list">
          {items.map((item) => (
            <article className="list-item-card" key={item.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  {item.meta.filter(Boolean).map((meta) => (
                    <span key={meta}>{meta}</span>
                  ))}
                </div>
                <h3 className="list-item-card__title">{item.title}</h3>
                {item.body ? <p className="list-item-card__body">{item.body}</p> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
