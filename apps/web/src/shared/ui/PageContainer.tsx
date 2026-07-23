import type { PropsWithChildren, ReactNode } from "react";

type PageContainerProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}>;

export function PageContainer({
  children,
  eyebrow: _eyebrow,
  title,
  description: _description,
  actions,
}: PageContainerProps) {
  return (
    <section className="page-container">
      <header className="page-container__intro">
        <h1 className="page-container__title">{title}</h1>
        {actions ? <div className="page-container__inline-actions">{actions}</div> : null}
      </header>
      <div className="page-container__content">{children}</div>
    </section>
  );
}
