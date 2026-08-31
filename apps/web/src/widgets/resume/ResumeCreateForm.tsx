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
    <section className={`page-card resume-create-form${className ? ` ${className}` : ""}`}>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">이력서 만들기</p>
          <h2 className="page-card__title">새 이력서 컨테이너를 시작하세요</h2>
          <p className="page-card__body resume-create-form__intro">
            면접 준비 기준 문서를 분리하려면 역할이나 지원 포지션별로 이력서 묶음을 따로 시작하는 편이 안전합니다.
          </p>
        </div>
      </div>
      <div className="resume-create-form__body">
        <label className="form-field">
          <span className="form-field__label">이력서 제목</span>
          <span className="form-field__hint">예: 백엔드 엔지니어 지원용, 제품 분석 포지션용</span>
          <input
            className="form-field__input"
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="이력서 묶음 이름을 입력하세요"
            value={title}
          />
        </label>
        <div className="resume-create-form__feedback">
          {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}
          {errorMessage ? <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" /> : null}
        </div>
        <div className="page-card__actions resume-create-form__actions">
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
