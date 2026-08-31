import { Link } from "react-router-dom";
import { useLocale } from "../i18n";

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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section
      aria-label={isKorean ? "작업공간 연속성" : "Workspace continuity"}
      className="page-card workspace-continuity-rail"
    >
      <div className="workspace-continuity-rail__header">
        <div>
          <span className="page-card__label">
            {isKorean ? "작업공간 연속성" : "Workspace continuity"}
          </span>
          <h2 className="page-card__title">
            {isKorean ? "하나로 이어지는 준비 루프" : "One connected preparation loop"}
          </h2>
        </div>
        <p className="page-card__body">
          {isKorean
            ? "화면을 이동해도 같은 주장, 약한 분기, 다음 행동이 계속 보이도록 유지하세요."
            : "Keep the same claim, weak branch, and next step visible as you move."}
        </p>
      </div>
      <div className="workspace-continuity-rail__columns">
        <section className="workspace-continuity-rail__column">
          <p className="workspace-continuity-rail__eyebrow">
            {isKorean ? "이전 컨텍스트" : "Upstream context"}
          </p>
          <div className="workspace-continuity-rail__stack">
            {upstream.map((item) => (
              <Link className="workspace-continuity-rail__surface" key={item.to} to={item.to}>
                <div className="workspace-continuity-rail__surface-line">
                  <span className="workspace-continuity-rail__status">
                    {isKorean ? "이전" : "Before"}
                  </span>
                  <strong>{item.title}</strong>
                </div>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="workspace-continuity-rail__column workspace-continuity-rail__column--current">
          <p className="workspace-continuity-rail__eyebrow">
            {isKorean ? "현재 화면" : "Current surface"}
          </p>
          <article className="workspace-continuity-rail__surface workspace-continuity-rail__surface--current">
            <div className="workspace-continuity-rail__surface-line">
              <span className="workspace-continuity-rail__status workspace-continuity-rail__status--current">
                {isKorean ? "현재" : "Current"}
              </span>
              <strong>{current.title}</strong>
            </div>
            <p>{current.description}</p>
          </article>
        </section>
        <section className="workspace-continuity-rail__column">
          <p className="workspace-continuity-rail__eyebrow">
            {isKorean ? "다음 화면" : "Next surfaces"}
          </p>
          <div className="workspace-continuity-rail__stack">
            {downstream.map((item) => (
              <Link className="workspace-continuity-rail__surface" key={item.to} to={item.to}>
                <div className="workspace-continuity-rail__surface-line">
                  <span className="workspace-continuity-rail__status workspace-continuity-rail__status--next">
                    {isKorean ? "다음" : "Next"}
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
