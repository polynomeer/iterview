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

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

const SKILL_TONE = { positive: "success", accent: "accent", warning: "warning", neutral: "neutral" } as const;
const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function severityRank(value: string | null) {
  const index = SEVERITY_ORDER.indexOf((value ?? "").toUpperCase());
  return index < 0 ? SEVERITY_ORDER.length : index;
}

function RisksCard({ risks, versionId }: { risks: ResumeSnapshotModel["risks"]; versionId: string }) {
  const { locale } = useLocale();
  const copy = useCopy();
  const sorted = [...risks].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  return (
    <Card aria-labelledby="resume-risks-title">
      <CardHeader
        actions={
          <ButtonLink size="sm" to={routeConfig.resumeHeatmap.buildPath({ versionId })} variant="ghost">
            {copy("압박 지도", "Pressure map")}
          </ButtonLink>
        }
        meta={copy("면접관이 파고들 가능성이 큰 주장", "Claims an interviewer is likely to probe")}
        title={<span id="resume-risks-title">{copy("방어가 필요한 부분", "Needs defending")}</span>}
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
                      {copy("질문", "Question")}
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
  const copy = useCopy();
  const { profile, contacts, skills } = snapshot;
  const facts = [profile?.yearsOfExperienceText, profile?.locationText].filter(Boolean);

  return (
    <Card aria-labelledby="resume-profile-title" padded>
      <h2 className="resume-card-title" id="resume-profile-title">
        {profile?.fullName ?? copy("프로필", "Profile")}
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
          <h3 className="resume-subtitle">{copy(`스킬 ${skills.length}`, `Skills ${skills.length}`)}</h3>
          <ul aria-label={copy("스킬", "Skills")} className="resume-chips">
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
  const copy = useCopy();
  const { experiences, projects } = snapshot;

  return (
    <Card aria-labelledby="resume-experience-title">
      <CardHeader title={<span id="resume-experience-title">{copy("경력과 프로젝트", "Experience and projects")}</span>} titleAs="h2" />
      <CardBody>
        {experiences.length === 0 && projects.length === 0 ? (
          <p className="resume-muted">{copy("추출된 경력이 없어요.", "No experience was extracted.")}</p>
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
                    {experience.current ? <Badge tone="accent">{copy("재직 중", "Current")}</Badge> : null}
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
              {experiences.length > 0 ? <h3 className="resume-subtitle">{copy("프로젝트", "Projects")}</h3> : null}
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
  const copy = useCopy();
  const rows = [
    ...snapshot.achievements.map((item) => ({ id: `achievement-${item.id}`, kind: copy("성과", "Achievement"), title: item.title, meta: [item.metricText, item.impactSummary] })),
    ...snapshot.education.map((item) => ({ id: `education-${item.id}`, kind: copy("학력", "Education"), title: item.institutionName, meta: [item.degreeName, item.fieldOfStudy, item.dateLabel] })),
    ...snapshot.certifications.map((item) => ({ id: `cert-${item.id}`, kind: copy("자격증", "Certification"), title: item.name, meta: [item.issuerName, item.dateLabel, item.scoreText] })),
    ...snapshot.awards.map((item) => ({ id: `award-${item.id}`, kind: copy("수상", "Award"), title: item.title, meta: [item.issuerName, item.awardedOnLabel] })),
  ];

  if (rows.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="resume-other-title">
      <CardHeader title={<span id="resume-other-title">{copy("성과 · 학력 · 자격", "Achievements, education, credentials")}</span>} titleAs="h2" />
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
  const copy = useCopy();
  const { versionId, version, status } = useResumeHub();
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId, status.canLoadSnapshots);
  const extraction = status.extractionQuery.data;
  const versionsPath = routeConfig.resumeVersions.buildPath({ versionId });

  if (version.parsingStatus === "failed") {
    return (
      <ErrorState
        actions={
          <ButtonLink to={versionsPath} variant="primary">
            {copy("새 PDF 올리기", "Upload a new PDF")}
          </ButtonLink>
        }
        body={version.parseErrorMessage ?? copy("PDF에서 글자를 읽지 못했어요. 텍스트가 선택되는 PDF로 다시 올려주세요.", "We couldn't read text from this PDF. Upload one with selectable text.")}
        title={copy("이력서를 분석하지 못했어요", "We couldn't analyze this resume")}
      />
    );
  }

  if (status.isProcessing || !status.canLoadSnapshots) {
    return (
      <Callout title={copy("이력서를 분석하고 있어요", "Analyzing your resume")} tone="accent">
        {copy(
          "보통 1분 안에 끝나요. 이 화면은 자동으로 새로고침돼요.",
          "This usually takes under a minute. This page refreshes on its own.",
        )}
      </Callout>
    );
  }

  if (snapshotsQuery.isLoading) {
    return <PageSkeleton label={copy("추출 결과를 불러오는 중", "Loading the extraction")} />;
  }

  if (snapshotsQuery.isError || !snapshotsQuery.data) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void snapshotsQuery.refetch()} variant="primary">
            {copy("다시 시도", "Try again")}
          </Button>
        }
        body={userFacingErrorMessage(snapshotsQuery.error, copy("추출 결과를 불러오지 못했어요.", "The extraction could not be loaded."))}
        details={getErrorDetails(snapshotsQuery.error)}
        title={copy("추출 결과를 불러올 수 없어요", "Unable to load the extraction")}
      />
    );
  }

  const snapshot = snapshotsQuery.data;
  const isEmpty = !snapshot.profile && snapshot.skills.length === 0 && snapshot.experiences.length === 0 && snapshot.projects.length === 0;

  return (
    <div className="resume-overview">
      {extraction?.extractionStatus === "fallback" || extraction?.extractionStatus === "skipped" ? (
        <Callout icon="info" tone="accent">
          {copy(
            "정밀 추출 대신 기본 추출을 사용했어요. 일부 항목이 빠졌다면 버전 관리에서 추출을 다시 실행하세요.",
            "Basic extraction was used. If items are missing, re-run extraction from Versions.",
          )}
        </Callout>
      ) : null}
      {extraction?.extractionStatus === "failed" ? (
        <Callout tone="danger">
          {extraction.errorMessage ?? copy("구조화 추출에 실패했어요. 버전 관리에서 다시 실행할 수 있어요.", "Extraction failed. You can re-run it from Versions.")}
        </Callout>
      ) : null}
      {isEmpty ? (
        <EmptyState
          actions={
            <ButtonLink to={versionsPath} variant="primary">
              {copy("버전 관리로", "Go to versions")}
            </ButtonLink>
          }
          body={copy("이 버전에서 추출된 내용이 없어요.", "Nothing was extracted from this version.")}
          title={copy("추출된 내용이 없어요", "Nothing extracted")}
        />
      ) : (
        <div className="resume-overview__grid">
          <div className="resume-overview__main">
            {snapshot.risks.length > 0 ? <RisksCard risks={snapshot.risks} versionId={versionId} /> : null}
            <ExperienceCard snapshot={snapshot} />
            <OtherSectionsCard snapshot={snapshot} />
          </div>
          <aside aria-label={copy("프로필과 스킬", "Profile and skills")} className="resume-overview__aside">
            <ProfileCard snapshot={snapshot} />
          </aside>
        </div>
      )}
    </div>
  );
}
