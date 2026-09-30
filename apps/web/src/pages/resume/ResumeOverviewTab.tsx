import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { severityLabel } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  ListRow,
  PageSkeleton,
} from "../../shared/ui/primitives";
import { useResumeHub } from "./ResumeHubLayout";

const SKILL_TONE = { positive: "success", accent: "accent", warning: "warning", neutral: "neutral" } as const;
const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function severityRank(value: string | null) {
  const index = SEVERITY_ORDER.indexOf((value ?? "").toUpperCase());
  return index < 0 ? SEVERITY_ORDER.length : index;
}

function RisksCard({ risks, versionId }: { risks: ResumeSnapshotModel["risks"]; versionId: string }) {
  const { t, locale } = useLocale();
  const sorted = [...risks].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  return (
    <Card aria-labelledby="resume-risks-title">
      <CardHeader
        actions={
          <ButtonLink size="sm" to={routeConfig.resumeHeatmap.buildPath({ versionId })} variant="ghost">
            {t("resumeHub.pressureMap")}
          </ButtonLink>
        }
        meta={t("resumeHub.claimsAnInterviewerIsLikely")}
        title={<span id="resume-risks-title">{t("resumeHub.needsDefending")}</span>}
        titleAs="h2"
      />
      {sorted.map((risk) => {
          const severity = severityLabel(risk.severity, locale);
          return (
            <ListRow
              key={risk.id}
              meta={risk.description}
              title={risk.title}
              trailing={
                <span className="resume-row-actions">
                  {severity ? <Badge tone={severity.tone}>{severity.label}</Badge> : null}
                  {risk.linkedQuestionId ? (
                    <ButtonLink size="sm" to={routeConfig.questionDetail.buildPath({ questionId: risk.linkedQuestionId })} variant="ghost">
                      {t("resumeHub.question")}
                    </ButtonLink>
                  ) : null}
                </span>
              }
            />
          );
        })}
    </Card>
  );
}

function ProfileCard({ snapshot }: { snapshot: ResumeSnapshotModel }) {
  const { t } = useLocale();
  const { profile, contacts, skills } = snapshot;
  const facts = [profile?.yearsOfExperienceText, profile?.locationText].filter(Boolean);

  return (
    <Card aria-labelledby="resume-profile-title" padded>
      <h2 className="resume-card-title" id="resume-profile-title">
        {profile?.fullName ?? t("resumeHub.profile")}
      </h2>
      {profile?.headline ? <p className="resume-profile__headline">{profile.headline}</p> : null}
      {facts.length > 0 ? <p className="resume-muted">{facts.join(" · ")}</p> : null}
      {profile?.summaryText ? <p className="resume-body">{profile.summaryText}</p> : null}
      {contacts.length > 0 ? (
        <ul className="resume-contacts">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <span className="resume-muted">{contact.title}</span>
              {contact.url ? (
                <a href={contact.url} rel="noreferrer" target="_blank">
                  {contact.value}
                </a>
              ) : (
                <span>{contact.value}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {skills.length > 0 ? (
        <>
          <h3 className="resume-subtitle">{t("resumeHub.skillsCount", { count: skills.length })}</h3>
          <ul aria-label={t("resumeHub.skills")} className="resume-chips">
            {skills.map((skill) => (
              <li key={skill.id}>
                <Badge tone={SKILL_TONE[skill.tone]}>{skill.label}</Badge>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Card>
  );
}

function ExperienceCard({ snapshot }: { snapshot: ResumeSnapshotModel }) {
  const { t } = useLocale();
  const { experiences, projects } = snapshot;

  return (
    <Card aria-labelledby="resume-experience-title">
      <CardHeader title={<span id="resume-experience-title">{t("resumeHub.experienceAndProjects")}</span>} titleAs="h2" />
      <CardBody>
        {experiences.length === 0 && projects.length === 0 ? (
          <p className="resume-muted">{t("resumeHub.noExperienceWasExtracted")}</p>
        ) : null}
        {experiences.length > 0 ? (
          <ol className="resume-timeline">
            {experiences.map((experience) => {
              const related = projects.filter((project) => project.relatedExperienceId === experience.id);
              return (
                <li key={experience.id}>
                  <div className="resume-timeline__head">
                    <strong>{experience.companyName}</strong>
                    <span className="resume-muted">{[experience.roleName, experience.dateLabel].filter(Boolean).join(" · ")}</span>
                    {experience.current ? <Badge tone="accent">{t("resumeHub.current")}</Badge> : null}
                  </div>
                  {experience.summary ? <p className="resume-body">{experience.summary}</p> : null}
                  {experience.impactText ? <p className="resume-impact">{experience.impactText}</p> : null}
                  {related.length > 0 ? <ProjectList projects={related} /> : null}
                </li>
              );
            })}
          </ol>
        ) : null}
        {(() => {
          const loose = projects.filter((project) => !experiences.some((experience) => experience.id === project.relatedExperienceId));
          return loose.length > 0 ? (
            <>
              {experiences.length > 0 ? <h3 className="resume-subtitle">{t("resumeHub.projects")}</h3> : null}
              <ProjectList projects={loose} />
            </>
          ) : null;
        })()}
      </CardBody>
    </Card>
  );
}

function ProjectList({ projects }: { projects: ResumeSnapshotModel["projects"] }) {
  return (
    <ul className="resume-projects">
      {projects.map((project) => (
        <li key={project.id}>
          <strong>{project.title}</strong>
          <span className="resume-muted">{[project.roleName, project.dateLabel].filter(Boolean).join(" · ")}</span>
          {project.summary ? <p className="resume-body">{project.summary}</p> : null}
          {project.techStackText ? <p className="resume-muted">{project.techStackText}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function OtherSectionsCard({ snapshot }: { snapshot: ResumeSnapshotModel }) {
  const { t } = useLocale();
  const rows = [
    ...snapshot.achievements.map((item) => ({ id: `achievement-${item.id}`, kind: t("resumeHub.achievement"), title: item.title, meta: [item.metricText, item.impactSummary] })),
    ...snapshot.education.map((item) => ({ id: `education-${item.id}`, kind: t("resumeHub.education"), title: item.institutionName, meta: [item.degreeName, item.fieldOfStudy, item.dateLabel] })),
    ...snapshot.certifications.map((item) => ({ id: `cert-${item.id}`, kind: t("resumeHub.certification"), title: item.name, meta: [item.issuerName, item.dateLabel, item.scoreText] })),
    ...snapshot.awards.map((item) => ({ id: `award-${item.id}`, kind: t("resumeHub.award"), title: item.title, meta: [item.issuerName, item.awardedOnLabel] })),
  ];

  if (rows.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="resume-other-title">
      <CardHeader title={<span id="resume-other-title">{t("resumeHub.achievementsEducationCredentials")}</span>} titleAs="h2" />
      {rows.map((row) => (
        <ListRow
          key={row.id}
          leading={<Badge>{row.kind}</Badge>}
          meta={row.meta.filter(Boolean).join(" · ") || undefined}
          title={row.title}
        />
      ))}
    </Card>
  );
}

/** 개요: what was extracted from this version, risks first. */
export function ResumeOverviewTab() {
  const { t } = useLocale();
  const { versionId, version, status } = useResumeHub();
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId, status.canLoadSnapshots);
  const extraction = status.extractionQuery.data;
  const versionsPath = routeConfig.resumeVersions.buildPath({ versionId });

  if (version.parsingStatus === "failed") {
    return (
      <ErrorState
        actions={
          <ButtonLink to={versionsPath} variant="primary">
            {t("resumeHub.uploadANewPdf")}
          </ButtonLink>
        }
        body={version.parseErrorMessage ?? t("resumeHub.weCouldntReadTextFrom")}
        title={t("resumeHub.weCouldntAnalyzeThisResume")}
      />
    );
  }

  if (status.isProcessing || !status.canLoadSnapshots) {
    return (
      <Callout title={t("resumeHub.analyzingYourResume")} tone="accent">
        {t("resumeHub.thisUsuallyTakesUnderA")}
      </Callout>
    );
  }

  if (snapshotsQuery.isLoading) {
    return <PageSkeleton label={t("resumeHub.loadingTheExtraction")} />;
  }

  if (snapshotsQuery.isError || !snapshotsQuery.data) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void snapshotsQuery.refetch()} variant="primary">
            {t("resumeHub.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(snapshotsQuery.error, t("resumeHub.theExtractionCouldNotBe"))}
        details={getErrorDetails(snapshotsQuery.error)}
        title={t("resumeHub.unableToLoadTheExtraction")}
      />
    );
  }

  const snapshot = snapshotsQuery.data;
  const isEmpty = !snapshot.profile && snapshot.skills.length === 0 && snapshot.experiences.length === 0 && snapshot.projects.length === 0;

  return (
    <div className="resume-overview">
      {extraction?.extractionStatus === "fallback" || extraction?.extractionStatus === "skipped" ? (
        <Callout icon="info" tone="accent">
          {t("resumeHub.basicExtractionWasUsedIf")}
        </Callout>
      ) : null}
      {extraction?.extractionStatus === "failed" ? (
        <Callout tone="danger">
          {extraction.errorMessage ?? t("resumeHub.extractionFailedYouCanRe")}
        </Callout>
      ) : null}
      {isEmpty ? (
        <EmptyState
          actions={
            <ButtonLink to={versionsPath} variant="primary">
              {t("resumeHub.goToVersions")}
            </ButtonLink>
          }
          body={t("resumeHub.nothingWasExtractedFromThis")}
          title={t("resumeHub.nothingExtracted")}
        />
      ) : (
        <div className="resume-overview__grid">
          <div className="resume-overview__main">
            {snapshot.risks.length > 0 ? <RisksCard risks={snapshot.risks} versionId={versionId} /> : null}
            <ExperienceCard snapshot={snapshot} />
            <OtherSectionsCard snapshot={snapshot} />
          </div>
          <aside aria-label={t("resumeHub.profileAndSkills")} className="resume-overview__aside">
            <ProfileCard snapshot={snapshot} />
          </aside>
        </div>
      )}
    </div>
  );
}
