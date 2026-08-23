import { useState } from "react";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";

type TargetCompanySelectorProps = {
  className?: string;
  companies: string[];
  onChange: (companies: string[]) => void;
  onSubmit: () => void;
  isPending: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  errorDetails?: string[];
};

export function TargetCompanySelector({
  className,
  companies,
  onChange,
  onSubmit,
  isPending,
  statusMessage,
  errorMessage,
  errorDetails = [],
}: TargetCompanySelectorProps) {
  const [draftCompany, setDraftCompany] = useState("");

  function handleAddCompany() {
    const next = draftCompany.trim();

    if (!next || companies.includes(next)) {
      return;
    }

    onChange([...companies, next]);
    setDraftCompany("");
  }

  return (
    <section className={`page-card${className ? ` ${className}` : ""}`}>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Target companies</p>
          <h2 className="page-card__title">Track the companies you are aiming for</h2>
          <p className="page-card__body">
            Keep this list tight so later practice branches can stay grounded in real company
            targets.
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">{companies.length} saved</span>
      </div>
      <div className="auth-form">
        <label className="form-field">
          <span className="form-field__label">Add company</span>
          <input className="form-field__input" onChange={(e) => setDraftCompany(e.target.value)} value={draftCompany} />
        </label>
        <div className="page-card__actions">
          <button className="secondary-button" onClick={handleAddCompany} type="button">
            Add company
          </button>
        </div>
        <div className="chip-list">
          {companies.map((company) => (
            <button
              className="detail-chip detail-chip--accent target-company-chip"
              key={company}
              onClick={() => onChange(companies.filter((item) => item !== company))}
              type="button"
            >
              {company} ×
            </button>
          ))}
        </div>
        {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}
        {errorMessage ? <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" /> : null}
        <div className="page-card__actions">
          <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
            {isPending ? "Saving..." : "Save target companies"}
          </button>
        </div>
      </div>
    </section>
  );
}
