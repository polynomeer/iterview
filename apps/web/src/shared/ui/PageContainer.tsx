import type { PropsWithChildren, ReactNode } from "react";

type PageContainerProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}>;

export function PageContainer({
  children,
  eyebrow,
  title,
  description,
  actions,
}: PageContainerProps) {
  return (
    <section className="page-container">
      <header className="page-container__intro">
        <div className="page-container__intro-copy">
          <span className="page-container__eyebrow">{eyebrow}</span>
          <h1 className="page-container__title">{title}</h1>
          <p className="page-container__description">{description}</p>
        </div>
        {actions ? <div className="page-container__inline-actions">{actions}</div> : null}
      </header>
      <div className="page-container__content">{children}</div>
    </section>
  );
}
