import "./authScreens.css";

type AuthLoadingScreenProps = {
  title: string;
  description: string;
  meta?: string;
};

/** Full-page wait while the saved session is restored. */
export function AuthLoadingScreen({ title, description, meta }: AuthLoadingScreenProps) {
  return (
    <main aria-busy="true" className="auth-status">
      <section className="auth-status__panel" role="status">
        <h1 className="auth-status__title">{title}</h1>
        <p className="auth-status__body">{description}</p>
        <span aria-hidden="true" className="auth-status__progress" />
        {meta ? <p className="auth-status__meta">{meta}</p> : null}
      </section>
    </main>
  );
}
