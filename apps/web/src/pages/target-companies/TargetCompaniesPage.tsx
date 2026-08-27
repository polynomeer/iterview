import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";

type CompanyPriority = "high" | "medium" | "low";
type CompanyStatus = "active" | "watchlist" | "paused";

type ReadinessArea = {
  label: string;
  value: number;
};

type TargetCompanyRecord = {
  id: string;
  name: string;
  shortName: string;
  roleTrack: string;
  summary: string;
  priority: CompanyPriority;
  status: CompanyStatus;
  readiness: number;
  lastUpdated: string;
  focusAreas: string[];
  likelyLoops: string[];
  sourceSignals: string[];
  nextActions: Array<{
    title: string;
    body: string;
    to: string;
  }>;
  readinessAreas: ReadinessArea[];
  proofNotes: string[];
};

const TARGET_COMPANIES: TargetCompanyRecord[] = [
  {
    id: "stripe",
    name: "Stripe",
    shortName: "ST",
    roleTrack: "Backend engineer / payment infrastructure",
    summary: "Tie payment correctness, retry discipline, and operational ownership into one credible infrastructure narrative.",
    priority: "high",
    status: "active",
    readiness: 78,
    lastUpdated: "Today",
    focusAreas: ["Payment correctness", "Reliability metrics", "Failure isolation", "Operational ownership"],
    likelyLoops: [
      "Settlement retries and idempotency follow-ups",
      "Redis lock failure modes under jitter",
      "Ownership stories around incident containment",
    ],
    sourceSignals: [
      "Payment API platform fit",
      "Strong overlap with settlement reliability resume claims",
      "Interview loop likely to punish vague metrics quickly",
    ],
    nextActions: [
      {
        title: "Rehearse payment DFS branch",
        body: "Run the strongest payment correctness branch before general system design practice.",
        to: routeConfig.practice.buildPath(),
      },
      {
        title: "Tighten source-of-truth metrics",
        body: "Re-validate the numbers and proof chain behind settlement bullet claims.",
        to: routeConfig.resumeAnalysis.buildPath(),
      },
      {
        title: "Review imported job postings",
        body: "Compare current focus areas with the latest ingested Stripe-like roles.",
        to: routeConfig.resumeTailorJobPostings.buildPath(),
      },
    ],
    readinessAreas: [
      { label: "Resume proof", value: 84 },
      { label: "DFS branch depth", value: 76 },
      { label: "Behavioral ownership", value: 71 },
    ],
    proofNotes: [
      "Keep the duplicate-settlement reduction story quantitative and bounded.",
      "Show what still failed after the fix instead of pretending the design became absolute.",
      "Connect payment correctness to on-call judgment, not only technical implementation.",
    ],
  },
  {
    id: "kakao-pay",
    name: "Kakao Pay",
    shortName: "KP",
    roleTrack: "Backend engineer / fintech platform",
    summary: "Stress transaction flow clarity, partner integration complexity, and Korean production-scale operational trade-offs.",
    priority: "high",
    status: "active",
    readiness: 72,
    lastUpdated: "Yesterday",
    focusAreas: ["Transaction flow clarity", "Partner integrations", "Monitoring", "Rollback strategy"],
    likelyLoops: [
      "How partner failures change system boundaries",
      "Trade-offs between operational speed and correctness",
      "Explaining incident follow-up decisions in concrete terms",
    ],
    sourceSignals: [
      "Strong fintech overlap with prior payments work",
      "Operational communication depth matters almost as much as raw system design",
      "Localization and partner coordination examples can differentiate your stories",
    ],
    nextActions: [
      {
        title: "Open notes for partner-failure examples",
        body: "Turn integration anecdotes into structured interview-safe notes.",
        to: routeConfig.notes.buildPath(),
      },
      {
        title: "Review queue for weak payment nodes",
        body: "Revisit the branches where rollback and alerting details still collapse.",
        to: routeConfig.reviewQueue.buildPath(),
      },
      {
        title: "Rebuild resume defense",
        body: "Make sure every fintech claim is anchored to a specific project and period.",
        to: routeConfig.resume.buildPath(),
      },
    ],
    readinessAreas: [
      { label: "Narrative fit", value: 80 },
      { label: "Evidence density", value: 68 },
      { label: "Retry coverage", value: 67 },
    ],
    proofNotes: [
      "Use one partner-failure story end to end instead of listing many small examples.",
      "Clarify where monitoring ended and business rollback policy began.",
      "Prepare Korean-market scale context without overclaiming volumes you did not own directly.",
    ],
  },
  {
    id: "naver-cloud",
    name: "Naver Cloud",
    shortName: "NC",
    roleTrack: "Platform backend / distributed systems",
    summary: "Emphasize systems depth, traffic behavior, and trade-off reasoning over consumer product framing.",
    priority: "medium",
    status: "watchlist",
    readiness: 64,
    lastUpdated: "2 days ago",
    focusAreas: ["Distributed systems", "Traffic shaping", "Observability", "Cache behavior"],
    likelyLoops: [
      "Queueing and backpressure trade-offs",
      "Cache consistency versus latency under load",
      "Explaining infrastructure decisions without product-layer noise",
    ],
    sourceSignals: [
      "Closer to pure platform narrative than fintech stories",
      "Needs stronger infrastructure-specific examples outside payment domain",
      "Good candidate for broader systems study after core fintech loops stabilize",
    ],
    nextActions: [
      {
        title: "Study saved system design materials",
        body: "Use saved materials to widen platform vocabulary before another DFS pass.",
        to: routeConfig.bookmarks.buildPath(),
      },
      {
        title: "Practice question map",
        body: "Open deeper infrastructure branches instead of payment-first branches.",
        to: routeConfig.practice.buildPath(),
      },
      {
        title: "Edit supporting notes",
        body: "Promote platform examples that are currently buried inside mixed notes.",
        to: routeConfig.notes.buildPath(),
      },
    ],
    readinessAreas: [
      { label: "Platform examples", value: 59 },
      { label: "Branch breadth", value: 70 },
      { label: "Trade-off clarity", value: 63 },
    ],
    proofNotes: [
      "Do not force a payment framing where the platform story should stand alone.",
      "Prepare one cache or queue story with concrete latency and failure trade-offs.",
      "Reduce business-language padding and speak in system constraints sooner.",
    ],
  },
  {
    id: "toss",
    name: "Toss",
    shortName: "TS",
    roleTrack: "Backend engineer / product-scale reliability",
    summary: "Focus on execution speed, correctness pressure, and product-facing engineering judgment.",
    priority: "medium",
    status: "paused",
    readiness: 58,
    lastUpdated: "4 days ago",
    focusAreas: ["Execution speed", "Observability", "Product trade-offs", "Incident handling"],
    likelyLoops: [
      "Why a quick fix was acceptable or not",
      "Choosing between perfect architecture and shipment pressure",
      "Explaining metrics in a product-impact frame",
    ],
    sourceSignals: [
      "Requires stronger behavioral and prioritization stories",
      "Good overlap with operational ownership if examples are sharper",
      "Less urgent than active tracks this week",
    ],
    nextActions: [
      {
        title: "Open archive for validated answers",
        body: "Reuse proven response fragments instead of drafting from zero.",
        to: routeConfig.archive.buildPath(),
      },
      {
        title: "Run interview workspace",
        body: "Simulate a product-pressure loop and listen for vague prioritization language.",
        to: routeConfig.interview.buildPath(),
      },
      {
        title: "Refresh answer drafts",
        body: "Tighten answers where speed-versus-correctness trade-offs still sound generic.",
        to: routeConfig.questionDetail.buildPath({ questionId: "incident-prioritization" }),
      },
    ],
    readinessAreas: [
      { label: "Behavioral depth", value: 55 },
      { label: "Product framing", value: 61 },
      { label: "Operational detail", value: 58 },
    ],
    proofNotes: [
      "Practice naming the decision rule, not only the outcome.",
      "Be concrete about what was deferred and what risk you accepted.",
      "Turn one production incident into a clean interview loop instead of mentioning several loosely.",
    ],
  },
];

const COMPANY_STATUS_FILTERS: Array<{ key: CompanyStatus | "all"; label: string }> = [
  { key: "all", label: "All lanes" },
  { key: "active", label: "Active" },
  { key: "watchlist", label: "Watchlist" },
  { key: "paused", label: "Paused" },
];

function getPriorityLabel(priority: CompanyPriority) {
  switch (priority) {
    case "high":
      return "High priority";
    case "medium":
      return "Medium priority";
    case "low":
      return "Low priority";
  }
}

export function TargetCompaniesPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { isDesktop } = useLayoutMode();
  const [mode, setMode] = useState<"company" | "job-posting">("company");
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(TARGET_COMPANIES[0]?.id ?? "");

  const visibleCompanies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return TARGET_COMPANIES.filter((company) => {
      if (statusFilter !== "all" && company.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        company.name,
        company.roleTrack,
        company.summary,
        company.focusAreas.join(" "),
        company.likelyLoops.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [search, statusFilter]);

  const selectedCompany =
    visibleCompanies.find((company) => company.id === selectedCompanyId) ??
    TARGET_COMPANIES.find((company) => company.id === selectedCompanyId) ??
    visibleCompanies[0] ??
    TARGET_COMPANIES[0];

  const activeCount = TARGET_COMPANIES.filter((company) => company.status === "active").length;
  const highPriorityCount = TARGET_COMPANIES.filter((company) => company.priority === "high").length;
  const averageReadiness = Math.round(
    TARGET_COMPANIES.reduce((sum, company) => sum + company.readiness, 0) / TARGET_COMPANIES.length,
  );
  const statusFilters = COMPANY_STATUS_FILTERS.map((filter) => ({
    ...filter,
    label:
      filter.key === "all"
        ? isKorean
          ? "전체 레인"
          : filter.label
        : filter.key === "active"
          ? isKorean
            ? "활성"
            : filter.label
          : filter.key === "watchlist"
            ? isKorean
              ? "관심 목록"
              : filter.label
            : isKorean
              ? "중지"
              : filter.label,
  }));

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.resumeTailorJobPostings.buildPath()}>
            {isKorean ? "채용공고 열기" : "Open job postings"}
          </Link>
          <Link className="secondary-button" to={routeConfig.resumeAnalysis.buildPath()}>
            {isKorean ? "이력서 분석 열기" : "Open resume analysis"}
          </Link>
        </>
      }
      description={isKorean ? "지금 중요한 회사와 해당 회사가 압박할 인터뷰 루프, 그리고 준비도를 가장 빨리 올려주는 source of truth 보강 지점을 추적하세요." : "Track which companies matter now, which interview loops they are likely to stress, and which source-of-truth repairs improve readiness fastest."}
      eyebrow={isKorean ? "회사 신호" : "Company signals"}
      title={isKorean ? "회사 준비 보드" : "Company preparation board"}
    >
      <section className="page-card target-companies-workspace-surface">
        <div className="target-companies-workspace-surface__header">
          <div className="target-companies-workspace-surface__intro">
            <div className="target-companies-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "준비 레인" : "Preparation lanes"}</span>
              <span className="question-status-badge question-status-badge--accent">{isKorean ? "회사별 준비" : "Company-specific"}</span>
            </div>
            <h2 className="target-companies-workspace-surface__title">
              {isKorean ? "채용공고 수집과 회사 준비도를 분리하고, 인터뷰 압박 기준으로 준비하세요" : "Separate company readiness from job-posting ingestion and prepare by interview pressure"}
            </h2>
            <p className="target-companies-workspace-surface__body">
              {isKorean
                ? "채용공고는 시장에 무엇이 있는지 알려줍니다. 이 보드는 어떤 회사를 실제로 준비할지, 어떤 스토리를 집요하게 파고들지, 다음에 이력서와 DFS 가지에서 무엇을 보강할지 결정합니다."
                : "Job postings tell you what exists in the market. This board decides which companies deserve active preparation, which stories they will probe, and what to repair next in your resume and DFS branches."}
            </p>
          </div>
          <div className="target-companies-workspace-surface__stats">
            <article>
              <span>{isKorean ? "추적 중인 회사" : "Tracked companies"}</span>
              <strong>{TARGET_COMPANIES.length}</strong>
            </article>
            <article>
              <span>{isKorean ? "활성 레인" : "Active lanes"}</span>
              <strong>{activeCount}</strong>
            </article>
            <article>
              <span>{isKorean ? "높은 우선순위" : "High priority"}</span>
              <strong>{highPriorityCount}</strong>
            </article>
            <article>
              <span>{isKorean ? "평균 준비도" : "Average readiness"}</span>
              <strong>{averageReadiness}%</strong>
            </article>
          </div>
        </div>
      </section>

      <div className={`target-companies-layout ${isDesktop ? "target-companies-layout--desktop" : ""}`}>
        <main className="page-stack">
          <section className="page-card target-companies-create-card">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "모드 분리" : "Mode split"}</p>
                <h2 className="section-heading__title">{isKorean ? "회사 추적과 공고 수집을 분리하세요" : "Keep company tracking distinct from role ingestion"}</h2>
              </div>
            </div>
            <div className="target-companies-create-card__mode-switch">
              <button
                className={`target-companies-create-card__mode${mode === "company" ? " target-companies-create-card__mode--active" : ""}`}
                onClick={() => {
                  setMode("company");
                }}
                type="button"
              >
                {isKorean ? "회사 보드" : "Company board"}
              </button>
              <button
                className={`target-companies-create-card__mode${mode === "job-posting" ? " target-companies-create-card__mode--active" : ""}`}
                onClick={() => {
                  setMode("job-posting");
                }}
                type="button"
              >
                {isKorean ? "채용공고 수집" : "Job posting intake"}
              </button>
            </div>
            <p className="page-card__body">
              {mode === "company"
                ? isKorean
                  ? "중요한 회사를 이미 골랐고, 회사별 인터뷰 루프에 맞는 준비 계획이 필요할 때 이 보드를 사용하세요."
                  : "Use this board when you have already chosen the companies that matter and need a preparation plan per loop."
                : isKorean
                  ? "외부 신호를 아직 수집 중이고 그것을 resume-tailor 파이프라인에 다시 연결해야 할 때 채용공고 수집 화면을 사용하세요."
                  : "Use job posting intake when you are still collecting external signals and mapping them back to your resume-tailor pipeline."}
            </p>
            {mode === "job-posting" ? (
              <Link className="primary-button" to={routeConfig.resumeTailorJobPostings.buildPath()}>
                {isKorean ? "채용공고 수집으로 이동" : "Go to job posting intake"}
              </Link>
            ) : (
              <div className="chip-list" aria-label={isKorean ? "회사 보드 원칙" : "Company board rules"}>
                <span className="detail-chip">{isKorean ? "1. 현재 집중할 회사를 고르기" : "1. Pick the active company"}</span>
                <span className="detail-chip">{isKorean ? "2. 약한 증빙 체인 보강하기" : "2. Repair the weak proof chain"}</span>
                <span className="detail-chip">{isKorean ? "3. 가능성 높은 가지 루프 리허설" : "3. Rehearse the likely branch loop"}</span>
              </div>
            )}
          </section>

          <section className="page-card target-companies-board">
            <div className="target-companies-board__toolbar">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "회사 레인" : "Company lanes"}</p>
                  <h2 className="section-heading__title">{isKorean ? "저장된 공고가 아니라 준비 압박 기준으로 우선순위를 정하세요" : "Prioritize by preparation pressure, not by saved postings alone"}</h2>
                </div>
              </div>
              <div className="target-companies-board__filters">
                <label className="target-companies-board__search">
                  <input
                    aria-label={isKorean ? "목표 회사 검색" : "Search target companies"}
                    onChange={(event) => {
                      setSearch(event.target.value);
                    }}
                    placeholder={isKorean ? "회사, 포커스 영역, 예상 루프 검색" : "Search companies, focus areas, or likely loops"}
                    type="search"
                    value={search}
                  />
                </label>
                <label className="target-companies-board__select">
                  <span>{isKorean ? "상태 레인" : "Status lane"}</span>
                  <select
                    aria-label={isKorean ? "상태별 목표 회사 필터" : "Filter target companies by status"}
                    onChange={(event) => {
                      setStatusFilter(event.target.value as CompanyStatus | "all");
                    }}
                    value={statusFilter}
                  >
                    {statusFilters.map((filter) => (
                      <option key={filter.key} value={filter.key}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="target-companies-board__list">
              {visibleCompanies.map((company) => (
                <button
                  className={`target-company-card${company.id === selectedCompany?.id ? " target-company-card--active" : ""}`}
                  key={company.id}
                  onClick={() => {
                    setSelectedCompanyId(company.id);
                  }}
                  type="button"
                >
                  <div className="target-company-card__identity">
                    <div aria-hidden="true" className="target-company-card__logo">
                      {company.shortName}
                    </div>
                    <div className="target-company-card__title-block">
                      <div className="target-company-card__headline">
                        <strong>{company.name}</strong>
                        <span className={`target-company-card__priority target-company-card__priority--${company.priority}`}>
                          {getPriorityLabel(company.priority)}
                        </span>
                      </div>
                      <div className="target-company-card__subline">
                        <span>{company.roleTrack}</span>
                        <span>{company.lastUpdated}</span>
                      </div>
                    </div>
                  </div>

                  <div className="target-company-card__content">
                    <section className="target-company-card__section">
                      <span>{isKorean ? "이 레인이 중요한 이유" : "Why this lane matters"}</span>
                      <p className="page-card__body">{company.summary}</p>
                    </section>

                    <section className="target-company-card__section">
                      <span>{isKorean ? "예상 루프" : "Likely loops"}</span>
                      <ul>
                        {company.likelyLoops.map((loop) => (
                          <li key={loop}>{loop}</li>
                        ))}
                      </ul>
                    </section>

                    <div className="target-company-card__readiness">
                      <span>{isKorean ? "준비도" : "Readiness"}</span>
                      <div className="target-company-card__readiness-ring">
                        <strong>{company.readiness}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="target-company-card__chips" aria-label={isKorean ? `${company.name} 포커스 영역` : `${company.name} focus areas`}>
                    {company.focusAreas.map((area) => (
                      <span className="detail-chip" key={area}>
                        {area}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>

        {selectedCompany ? (
          <aside className="page-card target-company-detail-rail">
            <div className="target-company-detail-rail__hero">
              <div aria-hidden="true" className="target-company-detail-rail__logo">
                {selectedCompany.shortName}
              </div>
              <div>
                <strong>{selectedCompany.name}</strong>
                <p>{selectedCompany.roleTrack}</p>
              </div>
            </div>

            <section className="target-company-detail-rail__panel">
              <div className="target-company-detail-rail__panel-header">
                <span>{isKorean ? "준비도 구성" : "Readiness shape"}</span>
                <strong>{isKorean ? `${selectedCompany.readiness}% 준비됨` : `${selectedCompany.readiness}% ready`}</strong>
              </div>
              <div className="target-company-detail-rail__bars">
                {selectedCompany.readinessAreas.map((area) => (
                  <div className="target-company-detail-rail__bar-row" key={area.label}>
                    <span>{area.label}</span>
                    <div aria-hidden="true" className="target-company-detail-rail__bar-track">
                      <div className="target-company-detail-rail__bar-fill" style={{ width: `${area.value}%` }} />
                    </div>
                    <strong>{area.value}%</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="target-company-detail-rail__panel">
              <div className="target-company-detail-rail__panel-header">
                <span>{isKorean ? "신호 요약" : "Signal summary"}</span>
                <strong>{isKorean ? "예상되는 압박" : "What to expect"}</strong>
              </div>
              <div className="target-company-card__chips">
                {selectedCompany.focusAreas.map((area) => (
                  <span className="detail-chip" key={area}>
                    {area}
                  </span>
                ))}
              </div>
              <ul className="page-card__list">
                {selectedCompany.sourceSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </section>

            <section className="target-company-detail-rail__panel">
              <div className="target-company-detail-rail__panel-header">
                <span>{isKorean ? "증빙 노트" : "Proof notes"}</span>
                <strong>{isKorean ? "다음 루프 전에 보강할 것" : "Repairs before the next loop"}</strong>
              </div>
              <ul className="page-card__list">
                {selectedCompany.proofNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>

            <section className="target-company-detail-rail__panel">
              <div className="target-company-detail-rail__panel-header">
                <span>{isKorean ? "다음 액션" : "Next actions"}</span>
                <strong>{isKorean ? "이 레인에서 이어서 진행" : "Continue from this lane"}</strong>
              </div>
              <div className="target-company-detail-rail__actions-list">
                {selectedCompany.nextActions.map((action) => (
                  <Link className="target-company-detail-rail__action-card" key={action.title} to={action.to}>
                    <div>
                      <strong>{action.title}</strong>
                      <span>{action.body}</span>
                    </div>
                    <span aria-hidden="true">{isKorean ? "이동" : "->"}</span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default TargetCompaniesPage;
