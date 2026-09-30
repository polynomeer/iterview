import { useState } from "react";
import { useActivateResumeVersionMutation } from "../../features/resume/api/useActivateResumeVersionMutation";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { parsingStatusLabel } from "../../shared/lib/labels";
import { Badge, ButtonLink, Callout, Dialog, Icon } from "../../shared/ui/primitives";

type ResumeVersionSwitcherProps = {
  open: boolean;
  onClose: () => void;
  /** Called after a different version became active, e.g. to follow it in the resume hub. */
  onActivated?: (versionId: string) => void;
};

/** Pick the active resume version for the whole app. */
export function ResumeVersionSwitcher({ open, onClose, onActivated }: ResumeVersionSwitcherProps) {
  const { locale, t } = useLocale();
  const { active, resumes } = useActiveResumeVersion();
  const activateMutation = useActivateResumeVersionMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const error = optionalErrorMessage(activateMutation.error, t("shell.versionSwitchError"));

  async function choose(versionId: string) {
    if (versionId === active?.id) {
      onClose();
      return;
    }
    setPendingId(versionId);
    try {
      await activateMutation.mutateAsync(versionId);
      onActivated?.(versionId);
      onClose();
    } catch {
      // Rendered through `error`.
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Dialog
      closeLabel={t("shell.close")}
      description={t("shell.versionSwitcherDescription")}
      footer={
        <ButtonLink icon="plus" onClick={onClose} to={active ? routeConfig.resumeVersions.buildPath({ versionId: active.id }) : routeConfig.resume.buildPath()}>
          {t("shell.uploadNewVersion")}
        </ButtonLink>
      }
      onClose={onClose}
      open={open}
      title={t("shell.versionSwitcherTitle")}
    >
      {error ? <Callout tone="danger">{error}</Callout> : null}
      {resumes.every((resume) => resume.versions.length === 0) ? (
        <p className="version-switcher__empty">{t("shell.noResumeYet")}</p>
      ) : (
        resumes.map((resume) => (
          <section aria-label={resume.title} className="version-switcher__resume" key={resume.id}>
            <h3 className="version-switcher__title">{resume.title}</h3>
            <ul className="version-switcher__list">
              {resume.versions.map((version) => {
                const isActive = version.id === active?.id;
                const status = parsingStatusLabel(version.parsingStatus, locale);
                return (
                  <li key={version.id}>
                    <button
                      aria-current={isActive ? "true" : undefined}
                      className="version-switcher__option"
                      disabled={pendingId !== null}
                      onClick={() => void choose(version.id)}
                      type="button"
                    >
                      <Icon name={isActive ? "check" : "resume"} />
                      <span className="version-switcher__copy">
                        <strong>{version.versionNumberLabel}</strong>
                        <span>{[version.fileNameLabel, version.uploadedAtLabel].filter(Boolean).join(" · ")}</span>
                      </span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {isActive ? <Badge tone="accent">{t("shell.activeVersion")}</Badge> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </Dialog>
  );
}
