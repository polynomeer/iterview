import { useState } from "react";
import { useCreateJobPostingMutation } from "../../features/resume-tailor/api/useCreateJobPostingMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";

export function ResumeTailorJobPostingsPage() {
  const [inputType, setInputType] = useState("text");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const jobPostingsQuery = useJobPostingsQuery();
  const createMutation = useCreateJobPostingMutation();

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
  }

  return (
    <PageContainer
      description="Save job postings from plain text or source links so you can reuse them across multiple immutable resume-version analyses."
      eyebrow="Resume Tailor"
      title="Job posting manager"
    >
      <div className="page-stack">
        <section className="page-card">
          <span className="page-card__label">Create</span>
          <h2 className="page-card__title">Save one target role</h2>
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
                For link mode, raw text is optional. The backend will try to fetch readable content
                from the remote page.
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
              <span className="form-field__hint">
                Required for text mode. Optional for link mode.
              </span>
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

        <section className="page-card">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">Saved</p>
              <h2 className="page-card__title">Saved job postings</h2>
            </div>
            <span className="section-heading__count">{jobPostingsQuery.data?.length ?? 0}</span>
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
            <div className="stack-list">
              {(jobPostingsQuery.data ?? []).map((jobPosting) => (
                <article className="list-item-card" key={jobPosting.id}>
                  <div className="list-item-card__content">
                    <div className="list-item-card__meta">
                      <span>{jobPosting.inputTypeLabel}</span>
                      <span>{jobPosting.fetchStatusLabel}</span>
                      {jobPosting.fetchedTitle ? <span>{jobPosting.fetchedTitle}</span> : null}
                    </div>
                    <h3 className="list-item-card__title">{jobPosting.title}</h3>
                    <p className="list-item-card__body">
                      {jobPosting.parsedSummary ?? "No parsed summary is available yet."}
                    </p>
                    {jobPosting.fetchErrorMessage ? (
                      <p className="resume-tailor-muted">{jobPosting.fetchErrorMessage}</p>
                    ) : null}
                    {jobPosting.parsedKeywords.length > 0 ? (
                      <div className="chip-list">
                        {jobPosting.parsedKeywords.slice(0, 8).map((keyword) => (
                          <span className="detail-chip detail-chip--accent" key={keyword}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
