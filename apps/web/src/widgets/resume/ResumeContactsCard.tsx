import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeContactsCardProps = {
  contacts: ResumeSnapshotModel["contacts"];
  sectionId?: string;
};

export function ResumeContactsCard({ contacts, sectionId }: ResumeContactsCardProps) {
  return (
    <ResumeSectionCard count={contacts.length} eyebrow="Contacts" sectionId={sectionId} title="Ways to verify and follow up">
      {contacts.length === 0 ? (
        <p className="page-card__body">No contact rows were extracted for this version yet.</p>
      ) : (
        <div className="stack-list">
          {contacts.map((contact) => (
            <article className="list-item-card" key={contact.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{contact.title}</span>
                  {contact.helperText ? <span>{contact.helperText}</span> : null}
                  {contact.isPrimary ? <span>Primary</span> : null}
                </div>
                <h3 className="list-item-card__title">{contact.value}</h3>
              </div>
              {contact.url ? (
                <a className="secondary-button" href={contact.url} rel="noreferrer" target="_blank">
                  Open
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
