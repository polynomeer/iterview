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
          <h2 className="page-card__title">One connected preparation loop</h2>
        </div>
        <p className="page-card__body">
          Keep the same claim, weak branch, and next DFS step visible as you move.
        </p>
      </div>
      <div className="workspace-continuity-rail__columns">
        <section className="workspace-continuity-rail__column">
          <p className="workspace-continuity-rail__eyebrow">Upstream context</p>
          <div className="workspace-continuity-rail__stack">
            {upstream.map((item) => (
              <Link className="workspace-continuity-rail__surface" key={item.to} to={item.to}>
                <div className="workspace-continuity-rail__surface-line">
                  <span className="workspace-continuity-rail__status">Before</span>
                  <strong>{item.title}</strong>
                </div>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="workspace-continuity-rail__column workspace-continuity-rail__column--current">
          <p className="workspace-continuity-rail__eyebrow">Current surface</p>
          <article className="workspace-continuity-rail__surface workspace-continuity-rail__surface--current">
            <div className="workspace-continuity-rail__surface-line">
              <span className="workspace-continuity-rail__status workspace-continuity-rail__status--current">
                Current
              </span>
              <strong>{current.title}</strong>
            </div>
            <p>{current.description}</p>
          </article>
        </section>
        <section className="workspace-continuity-rail__column">
          <p className="workspace-continuity-rail__eyebrow">Next surfaces</p>
          <div className="workspace-continuity-rail__stack">
            {downstream.map((item) => (
              <Link className="workspace-continuity-rail__surface" key={item.to} to={item.to}>
                <div className="workspace-continuity-rail__surface-line">
                  <span className="workspace-continuity-rail__status workspace-continuity-rail__status--next">
                    Next
                  </span>
                  <strong>{item.title}</strong>
                </div>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
