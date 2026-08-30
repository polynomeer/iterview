import { Link, useLocation } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

export function GuestHomeIntro() {
  const location = useLocation();
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="guest-home">
      <div className="guest-home__hero">
        <div className="guest-home__hero-copy">
          <span className="page-card__label">{isKorean ? "이력서 기반 모의면접" : "Resume-grounded mock interview"}</span>
          <h2 className="guest-home__title">
            {isKorean ? "모든 이력서 주장을 DFS 꼬리질문에도 버틸 때까지 점검하세요" : "Pressure-test every resume claim until it holds up under DFS follow-ups"}
          </h2>
          <p className="guest-home__body">
            {isKorean
              ? "Iterview는 이력서에서 상세한 기준 문서를 만들고, 각 주제를 더 깊은 꼬리질문 분기로 확장하며, 실제 면접 전에 답변 시뮬레이션을 도와줍니다."
              : "Iterview builds a detailed source of truth from your resume, expands each topic into deeper follow-up branches, and helps you simulate answers before the real interview."}
          </p>
          <div className="page-card__actions">
            <Link
              className="primary-button"
              state={{ redirectTo: `${location.pathname}${location.search}` }}
              to={routeConfig.login.buildPath()}
            >
              {isKorean ? "로그인" : "Login"}
            </Link>
            <Link className="secondary-button" to={routeConfig.signup.buildPath()}>
              {isKorean ? "계정 만들기" : "Create account"}
            </Link>
            <Link className="secondary-button" to={routeConfig.practice.buildPath()}>
              {isKorean ? "연습 질문 둘러보기" : "Browse practice questions"}
            </Link>
          </div>
        </div>
        <div className="guest-home__metrics">
          <article className="guest-home__metric">
            <span className="guest-home__metric-label">{isKorean ? "1. 맥락 구축" : "1. Build context"}</span>
            <strong className="guest-home__metric-value">{isKorean ? "이력서 문장을 검증 가능한 면접 근거로 바꾸기" : "Turn resume lines into verifiable interview evidence"}</strong>
          </article>
          <article className="guest-home__metric">
            <span className="guest-home__metric-label">{isKorean ? "2. 트리 탐색" : "2. Traverse the tree"}</span>
            <strong className="guest-home__metric-value">{isKorean ? "세부사항이 원자 단위가 될 때까지 모든 꼬리질문 분기를 따라가기" : "Walk every follow-up branch until the details become atomic"}</strong>
          </article>
          <article className="guest-home__metric">
            <span className="guest-home__metric-label">{isKorean ? "3. 답변 시뮬레이션" : "3. Simulate answers"}</span>
            <strong className="guest-home__metric-value">{isKorean ? "약한 지점을 연습하고 재도전하며 기준 문서를 다듬기" : "Rehearse weak spots, retry, and tighten the source of truth"}</strong>
          </article>
        </div>
      </div>

      <div className="guest-home__grid">
        <article className="guest-home__card">
          <span className="page-card__label">{isKorean ? "질문 트리" : "Question tree"}</span>
          <h3 className="page-card__title">{isKorean ? "면접의 깊이는 구조화된 꼬리질문 경로에서 나옵니다" : "Interview depth is driven by structured follow-up paths"}</h3>
          <p className="page-card__body">
            {isKorean
              ? "하나의 주장부터 시작해 범위, 트레이드오프, 의사결정, 지표, 실패까지 파고들어 면접관이 더 찌를 곳이 없을 때까지 내려가세요."
              : "Start from a single claim and keep drilling into scope, trade-offs, decisions, metrics, and failures until the interviewer has nowhere left to poke."}
          </p>
        </article>
        <article className="guest-home__card">
          <span className="page-card__label">{isKorean ? "기준 문서" : "Source of truth"}</span>
          <h3 className="page-card__title">{isKorean ? "이력서가 실제로 무엇을 의미하는지 문서로 정리하세요" : "Keep a written understanding of what your resume really means"}</h3>
          <p className="page-card__body">
            {isKorean
              ? "실제 프로젝트 맥락, 제약, 아키텍처, 결과를 기록해 어느 질문 분기에서도 답변이 일관되게 유지되도록 하세요."
              : "Capture the real project context, constraints, architecture, and outcomes so your answers stay consistent across every branch of questioning."}
          </p>
        </article>
        <article className="guest-home__card">
          <span className="page-card__label">{isKorean ? "답변 시뮬레이션" : "Answer simulation"}</span>
          <h3 className="page-card__title">{isKorean ? "연습하고 약점을 확인한 뒤 바로 재도전하세요" : "Practice, inspect weak points, and immediately retry"}</h3>
          <p className="page-card__body">
            {isKorean
              ? "답변 품질을 검토하고 모호한 주장을 찾아, 아직 작업이 필요한 정확한 질문 분기로 다시 돌아가세요."
              : "Review your answer quality, identify vague claims, and loop back into the exact question branch that still needs work."}
          </p>
        </article>
      </div>
    </section>
  );
}
