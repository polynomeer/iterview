import { useState, type ReactNode } from "react";

type ResumeSectionCardProps = {
  sectionId?: string;
  eyebrow: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function ResumeSectionCard({
  sectionId,
  eyebrow,
  title,
  count,
  defaultOpen = true,
  children,
}: ResumeSectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="page-card resume-section-card" id={sectionId}>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{eyebrow}</p>
          <h2 className="page-card__title">{title}</h2>
        </div>
        <div className="resume-section-card__header-actions">
          {typeof count === "number" ? <span className="section-heading__count">{count}</span> : null}
          <button
            aria-expanded={isOpen}
            className="secondary-button"
            onClick={() => {
              setIsOpen((current) => !current);
            }}
            type="button"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      {isOpen ? children : <p className="page-card__body">Section collapsed. Expand when you want to inspect this part of the resume.</p>}
    </section>
  );
}
