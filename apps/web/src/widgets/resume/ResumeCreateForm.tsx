import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";

type ResumeCreateFormProps = {
  className?: string;
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isPending: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  errorDetails?: string[];
};

export function ResumeCreateForm({
  className,
  title,
  onTitleChange,
  onSubmit,
  onCancel,
  isPending,
  statusMessage,
  errorMessage,
  errorDetails = [],
}: ResumeCreateFormProps) {
  return (
    <section className={`page-card${className ? ` ${className}` : ""}`}>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">이력서 만들기</p>
          <h2 className="page-card__title">새 이력서 컨테이너를 시작하세요</h2>
        </div>
      </div>
      <div className="auth-form">
        <label className="form-field">
          <span className="form-field__label">이력서 제목</span>
          <input className="form-field__input" onChange={(e) => onTitleChange(e.target.value)} value={title} />
        </label>
        {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}
        {errorMessage ? <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" /> : null}
        <div className="page-card__actions">
          {onCancel ? (
            <button className="secondary-button" onClick={onCancel} type="button">
              취소
            </button>
          ) : null}
          <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
            {isPending ? "생성 중..." : "이력서 만들기"}
          </button>
        </div>
      </div>
    </section>
  );
}
