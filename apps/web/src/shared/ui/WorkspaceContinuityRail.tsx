import { Link } from "react-router-dom";

type WorkspaceLink = {
  title: string;
  description: string;
  to: string;
};

type WorkspaceCurrentSurface = {
  title: string;
  description: string;
};

type WorkspaceContinuityRailProps = {
  current: WorkspaceCurrentSurface;
  downstream: WorkspaceLink[];
  upstream: WorkspaceLink[];
};

export function WorkspaceContinuityRail({
  current,
  downstream,
  upstream,
}: WorkspaceContinuityRailProps) {
  return (
    <section className="page-card workspace-continuity-rail" aria-label="Workspace continuity">
      <div className="workspace-continuity-rail__header">
        <div>
          <span className="page-card__label">Workspace continuity</span>
          <h2 className="page-card__title">Stay inside one interview preparation loop</h2>
        </div>
        <p className="page-card__body">
          Move between connected surfaces without losing the source claim, weak branch, or next DFS action.
        </p>
      </div>
      <div className="workspace-continuity-rail__columns">
        <section className="workspace-continuity-rail__column">
          <p className="workspace-continuity-rail__eyebrow">Upstream context</p>
          <div className="workspace-continuity-rail__stack">
            {upstream.map((item) => (
              <Link className="workspace-continuity-rail__surface" key={item.to} to={item.to}>
                <span className="workspace-continuity-rail__status">Before this</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="workspace-continuity-rail__column workspace-continuity-rail__column--current">
          <p className="workspace-continuity-rail__eyebrow">Current surface</p>
          <article className="workspace-continuity-rail__surface workspace-continuity-rail__surface--current">
            <span className="workspace-continuity-rail__status workspace-continuity-rail__status--current">
              Current surface
            </span>
            <strong>{current.title}</strong>
            <p>{current.description}</p>
          </article>
        </section>
        <section className="workspace-continuity-rail__column">
          <p className="workspace-continuity-rail__eyebrow">Next surfaces</p>
          <div className="workspace-continuity-rail__stack">
            {downstream.map((item) => (
              <Link className="workspace-continuity-rail__surface" key={item.to} to={item.to}>
                <span className="workspace-continuity-rail__status workspace-continuity-rail__status--next">
                  Next surface
                </span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
