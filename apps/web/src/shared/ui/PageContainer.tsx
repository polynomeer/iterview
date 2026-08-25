import type { PropsWithChildren, ReactNode } from "react";

type PageContainerProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  introVariant?: "default" | "minimal" | "hidden";
}>;

export function PageContainer({
  children,
  eyebrow,
  title,
  description,
  actions,
  introVariant = "default",
}: PageContainerProps) {
  return (
    <section className={`page-container page-container--${introVariant}`}>
      {introVariant !== "hidden" ? (
        <header className={`page-container__intro page-container__intro--${introVariant}`}>
          <div className="page-container__intro-copy">
            <span className="page-container__eyebrow">{eyebrow}</span>
            <h1 className="page-container__title">{title}</h1>
            <p className="page-container__description">{description}</p>
          </div>
          {actions ? <div className="page-container__inline-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="page-container__content">{children}</div>
    </section>
  );
}
