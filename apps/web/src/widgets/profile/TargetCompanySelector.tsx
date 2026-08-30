import { useState } from "react";
import { useLocale } from "../../shared/i18n";
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

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
          <p className="section-heading__eyebrow">{isKorean ? "목표 기업" : "Target companies"}</p>
          <h2 className="page-card__title">{isKorean ? "준비 중인 회사를 관리하세요" : "Track the companies you are aiming for"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "목록을 간결하게 유지해야 이후 연습 가지를 실제 지원 회사 기준에 맞춰 둘 수 있습니다."
              : "Keep this list tight so later practice branches can stay grounded in real company targets."}
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">
          {isKorean ? `${companies.length}개 저장됨` : `${companies.length} saved`}
        </span>
      </div>
      <div className="auth-form">
        <label className="form-field">
          <span className="form-field__label">{isKorean ? "회사 추가" : "Add company"}</span>
          <input className="form-field__input" onChange={(e) => setDraftCompany(e.target.value)} value={draftCompany} />
        </label>
        <div className="page-card__actions">
          <button className="secondary-button" onClick={handleAddCompany} type="button">
            {isKorean ? "회사 추가" : "Add company"}
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
            {isPending ? (isKorean ? "저장 중..." : "Saving...") : (isKorean ? "목표 기업 저장" : "Save target companies")}
          </button>
        </div>
      </div>
    </section>
  );
}
