import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCreateJobPostingMutation } from "../../features/resume-tailor/api/useCreateJobPostingMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";

type CompanyPriorityFilter = "all" | "high" | "medium" | "low";

function getPriorityTone(keywordCount: number) {
  if (keywordCount >= 8) {
    return { label: "High priority", modifier: "high" as const };
  }

  if (keywordCount >= 4) {
    return { label: "Medium priority", modifier: "medium" as const };
  }

  return { label: "Low priority", modifier: "low" as const };
}

function getFitLabel(requirementCount: number) {
  if (requirementCount >= 6) {
    return "Great fit";
  }

  if (requirementCount >= 3) {
    return "Good fit";
  }

  return "Fair fit";
}

function getReadinessValue(keywordCount: number, responsibilityCount: number) {
  return Math.min(96, 48 + keywordCount * 4 + responsibilityCount * 3);
}

function getKeywordCount(jobPosting: {
  parsedKeywords?: string[];
}) {
  return jobPosting.parsedKeywords?.length ?? 0;
}

function getRequirementCount(jobPosting: {
  parsedRequirements?: string[];
}) {
  return jobPosting.parsedRequirements?.length ?? 0;
}

function getResponsibilityCount(jobPosting: {
  parsedResponsibilities?: string[];
}) {
  return jobPosting.parsedResponsibilities?.length ?? 0;
}

export function ResumeTailorJobPostingsPage() {
  const { isDesktop } = useLayoutMode();
  const [inputType, setInputType] = useState("text");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<CompanyPriorityFilter>("all");
  const [selectedPostingId, setSelectedPostingId] = useState("");
  const jobPostingsQuery = useJobPostingsQuery();
  const createMutation = useCreateJobPostingMutation();

  const jobPostings = jobPostingsQuery.data ?? [];

  useEffect(() => {
    if (!selectedPostingId && jobPostings[0]?.id) {
      setSelectedPostingId(jobPostings[0].id);
    }
  }, [jobPostings, selectedPostingId]);

  const filteredPostings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return jobPostings.filter((jobPosting) => {
      const haystack = [
        jobPosting.title,
        jobPosting.companyName,
        jobPosting.roleName,
        jobPosting.parsedSummary,
        jobPosting.parsedKeywords.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (normalizedSearch && !haystack.includes(normalizedSearch)) {
        return false;
      }

      if (priorityFilter === "all") {
        return true;
      }

      return getPriorityTone(getKeywordCount(jobPosting)).modifier === priorityFilter;
    });
  }, [jobPostings, priorityFilter, search]);

  const selectedPosting =
    filteredPostings.find((jobPosting) => jobPosting.id === selectedPostingId) ??
    jobPostings.find((jobPosting) => jobPosting.id === selectedPostingId) ??
    filteredPostings[0] ??
    jobPostings[0] ??
    null;

  const isCreateDisabled =
    createMutation.isPending ||
    (inputType === "link" ? !sourceUrl.trim() : !rawText.trim());

  async function handleCreate() {
    const created = await createMutation.mutateAsync({
      inputType,
      sourceUrl: sourceUrl.trim() || null,
      rawText: rawText.trim() || null,
      companyName: companyName.trim() || null,
      roleName: roleName.trim() || null,
    });

    setInputType("text");
    setSourceUrl("");
    setRawText("");
    setCompanyName(created.companyName ?? "");
    setRoleName(created.roleName ?? "");
    setSelectedPostingId(created.id);
  }

  const highPriorityCount = jobPostings.filter(
    (jobPosting) => getPriorityTone(getKeywordCount(jobPosting)).modifier === "high",
  ).length;
  const averageReadiness =
    jobPostings.length > 0
      ? Math.round(
          jobPostings.reduce(
            (sum, jobPosting) =>
              sum + getReadinessValue(getKeywordCount(jobPosting), getResponsibilityCount(jobPosting)),
            0,
          ) / jobPostings.length,
        )
      : 0;

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.resumeTailor.buildPath()}>
            Resume tailor hub
          </Link>
          <Link className="secondary-button" to={routeConfig.resumeAnalysis.buildPath()}>
            Open resume analysis
          </Link>
        </>
      }
      description="Curate target companies and saved job postings so resume tailoring and DFS interview drills stay aligned to real hiring signals."
      eyebrow="Tailor flow"
      title="Capture the company context before tailoring the resume"
    >
      <section className="page-card target-companies-workspace-surface">
        <div className="target-companies-workspace-surface__header">
          <div className="target-companies-workspace-surface__intro">
            <div className="target-companies-workspace-surface__eyebrow-row">
              <span className="page-card__label">Target companies</span>
              <span className="detail-chip">Step 2 of 4</span>
              <span className="question-status-badge question-status-badge--accent">Company-aware prep</span>
            </div>
            <h2 className="target-companies-workspace-surface__title">Capture the role context that should shape the next tailored resume pass</h2>
            <p className="target-companies-workspace-surface__body">
              Save postings with enough structure to compare priorities, spot recurring themes, and keep each company tied
              to concrete follow-up pressure instead of generic interview prep.
            </p>
          </div>
          <div className="target-companies-workspace-surface__stats">
            <article>
              <span>Target companies</span>
              <strong>{jobPostings.length}</strong>
            </article>
            <article>
              <span>High priority</span>
              <strong>{highPriorityCount}</strong>
            </article>
            <article>
              <span>Avg. readiness</span>
              <strong>{`${averageReadiness}%`}</strong>
            </article>
          </div>
        </div>
      </section>

      <div className={`target-companies-layout ${isDesktop ? "target-companies-layout--desktop" : "target-companies-layout--mobile"}`}>
        <main className="target-companies-layout__main page-stack">
          <section className="page-card target-companies-create-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Capture target</p>
                <h2 className="page-card__title">Save one company and role context</h2>
              </div>
            </div>

            <div aria-label="Input type" className="target-companies-create-card__mode-switch" role="tablist">
              {[
                { key: "text", label: "Paste text" },
                { key: "link", label: "Import link" },
              ].map((option) => (
                <button
                  aria-selected={inputType === option.key}
                  className={`target-companies-create-card__mode${inputType === option.key ? " target-companies-create-card__mode--active" : ""}`}
                  key={option.key}
                  onClick={() => {
                    setInputType(option.key);
                  }}
                  role="tab"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span className="form-field__label">Input type</span>
                <select
                  className="form-input"
                  onChange={(event) => setInputType(event.target.value)}
                  value={inputType}
                >
                  <option value="text">Text</option>
                  <option value="link">Link</option>
                </select>
              </label>
              <label className="form-field">
                <span className="form-field__label">Company</span>
                <input
                  className="form-input"
                  onChange={(event) => setCompanyName(event.target.value)}
                  type="text"
                  value={companyName}
                />
              </label>
              <label className="form-field">
                <span className="form-field__label">Role</span>
                <input
                  className="form-input"
                  onChange={(event) => setRoleName(event.target.value)}
                  type="text"
                  value={roleName}
                />
              </label>
              <label className="form-field form-field--full">
                <span className="form-field__label">Source link</span>
                <input
                  className="form-input"
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://example.com/jobs/backend-platform-engineer"
                  type="url"
                  value={sourceUrl}
                />
                <span className="form-field__hint">
                  For link mode, raw text is optional. The backend will try to fetch readable content from the remote page.
                </span>
              </label>
              <label className="form-field form-field--full">
                <span className="form-field__label">Job posting text</span>
                <textarea
                  className="form-input form-input--textarea"
                  onChange={(event) => setRawText(event.target.value)}
                  placeholder="Paste the job description if you already have the text."
                  rows={8}
                  value={rawText}
                />
                <span className="form-field__hint">Required for text mode. Optional for link mode.</span>
              </label>
            </div>

            {createMutation.isError ? (
              <ErrorStateCard
                body={
                  createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "The job posting could not be created."
                }
                details={getErrorDetails(createMutation.error)}
                onAction={() => createMutation.reset()}
                title="Unable to save job posting"
              />
            ) : null}

            <div className="page-card__actions">
              <button
                className="primary-button"
                disabled={isCreateDisabled}
                onClick={() => {
                  void handleCreate();
                }}
                type="button"
              >
                {createMutation.isPending ? "Saving..." : "Save job posting"}
              </button>
            </div>
          </section>

          <section className="page-card target-companies-board">
            <div className="target-companies-board__toolbar">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Saved board</p>
                  <h2 className="page-card__title">Tracked companies</h2>
                </div>
                <span className="section-heading__count">{jobPostings.length}</span>
              </div>

              <div className="target-companies-board__filters">
                <label className="target-companies-board__search">
                  <input
                    aria-label="Search target companies"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search company, role, or keyword"
                    type="search"
                    value={search}
                  />
                </label>
                <label className="target-companies-board__select">
                  <span>Priority</span>
                  <select
                    aria-label="Priority filter"
                    onChange={(event) => setPriorityFilter(event.target.value as CompanyPriorityFilter)}
                    value={priorityFilter}
                  >
                    <option value="all">All priorities</option>
                    <option value="high">High priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="low">Low priority</option>
                  </select>
                </label>
              </div>
            </div>

            {jobPostingsQuery.isLoading ? (
              <LoadingStateCard
                body="Loading saved job postings and fetch metadata."
                title="Loading job postings"
              />
            ) : jobPostingsQuery.isError ? (
              <ErrorStateCard
                body={
                  jobPostingsQuery.error instanceof Error
                    ? jobPostingsQuery.error.message
                    : "Job postings could not be loaded."
                }
                details={getErrorDetails(jobPostingsQuery.error)}
                onAction={() => {
                  void jobPostingsQuery.refetch();
                }}
                title="Unable to load job postings"
              />
            ) : (
              <div className="target-companies-board__list">
                {filteredPostings.map((jobPosting) => {
                  const priority = getPriorityTone(getKeywordCount(jobPosting));
                  const fitLabel = getFitLabel(getRequirementCount(jobPosting));
                  const readiness = getReadinessValue(getKeywordCount(jobPosting), getResponsibilityCount(jobPosting));

                  return (
                    <button
                      className={`target-company-card${jobPosting.id === selectedPosting?.id ? " target-company-card--active" : ""}`}
                      key={jobPosting.id}
                      onClick={() => {
                        setSelectedPostingId(jobPosting.id);
                      }}
                      type="button"
                    >
                      <div className="target-company-card__identity">
                        <div className="target-company-card__logo">
                          {(jobPosting.companyName ?? jobPosting.title).slice(0, 1).toUpperCase()}
                        </div>
                        <div className="target-company-card__title-block">
                          <div className="target-company-card__headline">
                            <strong>{jobPosting.companyName ?? "Saved company"}</strong>
                            <span className={`target-company-card__priority target-company-card__priority--${priority.modifier}`}>
                              {priority.label}
                            </span>
                          </div>
                          <div className="target-company-card__subline">
                            <span>{jobPosting.roleName ?? "Role not specified"}</span>
                            <span>{fitLabel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="target-company-card__content">
                        <div className="target-company-card__section">
                          <span>Focus topics</span>
                          <div className="target-company-card__chips">
                            {(jobPosting.parsedKeywords ?? []).slice(0, 4).map((keyword) => (
                              <span className="detail-chip" key={keyword}>
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="target-company-card__section">
                          <span>Frequent themes</span>
                          <ul>
                            {((jobPosting.parsedResponsibilities ?? []).length > 0
                              ? jobPosting.parsedResponsibilities ?? []
                              : jobPosting.parsedRequirements ?? []
                            )
                              .slice(0, 3)
                              .map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                          </ul>
                        </div>
                        <div className="target-company-card__readiness">
                          <div className="target-company-card__readiness-ring">
                            <strong>{`${readiness}%`}</strong>
                          </div>
                          <span>Readiness</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="target-companies-layout__rail page-stack">
          {selectedPosting ? (
            <section className="page-card target-company-detail-rail">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Overview</p>
                  <h2 className="page-card__title">{selectedPosting.companyName ?? selectedPosting.title}</h2>
                </div>
              </div>

              <article className="target-company-detail-rail__hero">
                <div className="target-company-detail-rail__logo">
                  {(selectedPosting.companyName ?? selectedPosting.title).slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <strong>{selectedPosting.title}</strong>
                  <p>{selectedPosting.createdAtLabel}</p>
                </div>
              </article>

              <div className="target-company-detail-rail__panel">
                <div className="target-company-detail-rail__panel-header">
                  <span>Fit for you</span>
                  <strong>{getFitLabel(getRequirementCount(selectedPosting))}</strong>
                </div>
                <p>{selectedPosting.parsedSummary ?? "No parsed summary is available yet."}</p>
              </div>

              <div className="target-company-detail-rail__panel">
                <div className="target-company-detail-rail__panel-header">
                  <span>Readiness by topic</span>
                  <strong>{`${getReadinessValue(getKeywordCount(selectedPosting), getResponsibilityCount(selectedPosting))}%`}</strong>
                </div>
                <div className="target-company-detail-rail__bars">
                  {(selectedPosting.parsedKeywords ?? []).slice(0, 5).map((keyword, index) => {
                    const value = Math.max(54, 92 - index * 7);
                    return (
                      <div className="target-company-detail-rail__bar-row" key={keyword}>
                        <span>{keyword}</span>
                        <div className="target-company-detail-rail__bar-track">
                          <div className="target-company-detail-rail__bar-fill" style={{ width: `${value}%` }} />
                        </div>
                        <strong>{`${value}%`}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="target-company-detail-rail__panel">
                <div className="target-company-detail-rail__panel-header">
                  <span>Recommended next</span>
                </div>
                <div className="target-company-detail-rail__actions-list">
                  <Link className="target-company-detail-rail__action-card" to={routeConfig.resumeTailor.buildPath()}>
                    <div>
                      <strong>Start tailoring</strong>
                      <span>Generate a resume analysis from this saved posting.</span>
                    </div>
                    <span>Open</span>
                  </Link>
                  <Link className="target-company-detail-rail__action-card" to={routeConfig.practice.buildPath()}>
                    <div>
                      <strong>Practice follow-ups</strong>
                      <span>Move from company context into question drills.</span>
                    </div>
                    <span>Open</span>
                  </Link>
                </div>
              </div>

              {selectedPosting.fetchErrorMessage ? (
                <div className="target-company-detail-rail__panel">
                  <div className="target-company-detail-rail__panel-header">
                    <span>Fetch note</span>
                    <strong>{selectedPosting.fetchStatusLabel}</strong>
                  </div>
                  <p className="resume-tailor-muted">{selectedPosting.fetchErrorMessage}</p>
                </div>
              ) : null}
            </section>
          ) : null}
        </aside>
      </div>
    </PageContainer>
  );
}
