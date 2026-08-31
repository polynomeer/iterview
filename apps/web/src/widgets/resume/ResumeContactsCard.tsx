import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeContactsCardProps = {
  contacts: ResumeSnapshotModel["contacts"];
  sectionId?: string;
};

export function ResumeContactsCard({ contacts, sectionId }: ResumeContactsCardProps) {
  return (
    <ResumeSectionCard count={contacts.length} eyebrow="연락처" sectionId={sectionId} title="검증과 후속 확인에 쓰이는 정보">
      {contacts.length === 0 ? (
        <p className="page-card__body">아직 이 버전에서 연락처 정보가 추출되지 않았습니다.</p>
      ) : (
        <div className="stack-list">
          {contacts.map((contact) => (
            <article className="list-item-card resume-contact-card" key={contact.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{contact.title}</span>
                  {contact.helperText ? <span>{contact.helperText}</span> : null}
                  {contact.isPrimary ? <span>기본</span> : null}
                </div>
                <h3 className="list-item-card__title">{contact.value}</h3>
                <p className="list-item-card__helper">
                  {contact.url ? "바깥 링크를 열어 원문 프로필이나 공개 페이지를 확인할 수 있습니다." : "텍스트로만 추출된 연락 정보입니다."}
                </p>
              </div>
              {contact.url ? (
                <a className="secondary-button resume-contact-card__link" href={contact.url} rel="noreferrer" target="_blank">
                  열기
                </a>
              ) : (
                <div className="list-item-card__actions">
                  <span className="question-status-badge question-status-badge--neutral">링크 없음</span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
