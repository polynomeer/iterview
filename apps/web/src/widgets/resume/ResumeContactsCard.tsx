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
            <article className="list-item-card" key={contact.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{contact.title}</span>
                  {contact.helperText ? <span>{contact.helperText}</span> : null}
                  {contact.isPrimary ? <span>기본</span> : null}
                </div>
                <h3 className="list-item-card__title">{contact.value}</h3>
              </div>
              {contact.url ? (
                <a className="secondary-button" href={contact.url} rel="noreferrer" target="_blank">
                  열기
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
