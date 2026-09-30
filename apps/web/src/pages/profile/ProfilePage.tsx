import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mapCurrentUserDtoToProfileModel } from "../../entities/profile/model";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useUpdateProfileMutation } from "../../features/profile/api/useUpdateProfileMutation";
import { useUploadProfileImageMutation } from "../../features/profile/api/useUploadProfileImageMutation";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { ProfileEditForm, ProfileSummaryCard } from "../../widgets/profile";

function polarPoint(index: number, total: number, radius: number) {
  const angle = (-Math.PI / 2) + (index / total) * Math.PI * 2;
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  return { x, y };
}

function buildCareerPolygon(points: Array<{ score: number }>) {
  return points
    .map((point, index) => {
      const radius = Math.max(14, point.score * 0.28);
      const coords = polarPoint(index, points.length, radius);
      return `${coords.x},${coords.y}`;
    })
    .join(" ");
}

function getCompanyBadge(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export function ProfilePage() {
  const currentUserQuery = useCurrentUserQuery();
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadProfileImageMutation = useUploadProfileImageMutation();
  const [nickname, setNickname] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileImageStatus, setProfileImageStatus] = useState<string | null>(null);

  const currentProfile = currentUserQuery.data ? mapCurrentUserDtoToProfileModel(currentUserQuery.data) : null;
  const normalizedDailyQuestionCount = currentProfile?.dailyQuestionCount || "0";
  const scoreThresholdLabel = currentProfile?.targetScoreThreshold ? `${currentProfile.targetScoreThreshold}%` : t("profile.notSet");
  const languageLabel = currentProfile?.preferredLanguage === "ko" ? t("common.languageKorean") : t("common.languageEnglish");
  const roleLabel = currentProfile?.jobRole ?? t("profile.notSet");
  const experienceYears = Number(yearsOfExperience || currentProfile?.yearsOfExperience || "0");
  const targetRoleLabel =
    experienceYears >= 7
      ? (isKorean ? "스태프 백엔드 엔지니어" : "Staff Backend Engineer")
      : experienceYears >= 4
        ? (isKorean ? "시니어 백엔드 엔지니어" : "Senior Backend Engineer")
        : (isKorean ? "백엔드 엔지니어" : "Backend Engineer");

  useEffect(() => {
    if (!currentUserQuery.data) {
      return;
    }

    const profile = mapCurrentUserDtoToProfileModel(currentUserQuery.data);
    setNickname(profile.nickname);
    setJobRole(profile.jobRole);
    setYearsOfExperience(profile.yearsOfExperience);
    setTargetCompanies(profile.targetCompanies);
  }, [currentUserQuery.data]);

  const careerDna = [
    { label: isKorean ? "백엔드 개발" : "Backend Development", score: 92 },
    { label: isKorean ? "시스템 설계" : "System Design", score: 78 },
    { label: isKorean ? "문제 해결" : "Problem Solving", score: 85 },
    { label: isKorean ? "분산 시스템" : "Distributed Systems", score: 70 },
    { label: isKorean ? "클라우드/데브옵스" : "Cloud & DevOps", score: 75 },
    { label: isKorean ? "커뮤니케이션" : "Communication", score: 75 },
  ];

  const projectCards = [
    {
      id: "dreamus",
      title: "Dreamus Settlement System",
      period: "2022.08 - 2023.04",
      featured: true,
      body: isKorean
        ? "대용량 정산 트랜잭션, 감사 로그, 정합성 복구를 함께 다뤄야 했던 핵심 프로젝트입니다."
        : "Featured platform project covering high-volume settlement transactions, audit logs, and recovery flows.",
      tags: ["Java", "Spring Boot", "MySQL", "Kafka"],
      impact: isKorean ? "영향: 일 100만+ 요청, 가용성 99.9%" : "Impact: 1M+ requests/day, 99.9% uptime",
    },
    {
      id: "notification",
      title: isKorean ? "실시간 알림 서비스" : "Real-time Notification Service",
      period: "2022.01 - 2022.07",
      featured: false,
      body: isKorean
        ? "이벤트 기반 알림 파이프라인으로 사용자 선호 설정과 전달 안정성을 함께 설계했습니다."
        : "Event-driven notification service tuned for user preferences and delivery stability.",
      tags: ["Java", "Redis", "Kafka"],
      impact: isKorean ? "영향: 알림 지연 40% 감소" : "Impact: 40% faster delivery",
    },
    {
      id: "pipeline",
      title: isKorean ? "데이터 적재 파이프라인" : "Data Ingestion Pipeline",
      period: "2021.06 - 2021.12",
      featured: false,
      body: isKorean
        ? "대용량 ETL 처리와 운영 비용 최적화를 동시에 맞춘 적재 파이프라인입니다."
        : "Bulk ETL and data pipeline work balancing throughput with operating cost.",
      tags: ["AWS", "S3", "Spark", "Airflow"],
      impact: isKorean ? "영향: 비용 60% 절감" : "Impact: 60% cost reduction",
    },
  ];

  const featuredProject = projectCards[0];
  const timeline = [
    {
      id: "dreamus",
      period: isKorean ? "2022년 5월 - 현재" : "May 2022 - Present",
      company: "Dreamus",
      role: isKorean ? "백엔드 엔지니어" : "Backend Engineer",
      body: isKorean
        ? "정산과 정합성 복구가 얽힌 백엔드 서비스를 운영하며, 고부하 구간의 안정성과 추적성을 함께 개선했습니다."
        : "Built backend services where settlement reliability and recovery paths mattered under load.",
      tags: ["Java", "Spring Boot", "MySQL", "Kafka", "AWS"],
      tone: "accent",
    },
    {
      id: "bytecore",
      period: isKorean ? "2021년 6월 - 2022년 4월" : "Jun 2021 - Apr 2022",
      company: "ByteCore",
      role: isKorean ? "소프트웨어 엔지니어" : "Software Engineer",
      body: isKorean
        ? "마이크로서비스와 API 성능 최적화를 맡아 응답 시간과 운영 복잡도를 함께 줄였습니다."
        : "Worked on microservices and API tuning to reduce latency and operational drag.",
      tags: ["Java", "Redis", "Docker", "Kubernetes"],
      tone: "positive",
    },
    {
      id: "nethub",
      period: isKorean ? "2020년 1월 - 2021년 5월" : "Jan 2020 - May 2021",
      company: "NetHub",
      role: isKorean ? "소프트웨어 엔지니어" : "Software Engineer",
      body: isKorean
        ? "내부 운영 도구와 데이터 워크플로를 개발하며, 여러 팀이 공통으로 쓰는 도메인 지식을 구조화했습니다."
        : "Built shared internal tools and data workflows used by multiple teams.",
      tags: ["Java", "JavaScript", "PostgreSQL"],
      tone: "purple",
    },
  ];

  const relatedQuestions = [
    {
      title: isKorean ? "고처리량 정산 시스템을 어떻게 설계하겠습니까?" : "How would you design a high-throughput settlement system?",
      label: "System Design",
      score: 85,
    },
    {
      title: isKorean ? "트랜잭션 처리에서 멱등성을 어떻게 보장하겠습니까?" : "How would you ensure idempotency in transaction processing?",
      label: "System Design",
      score: 82,
    },
    {
      title: isKorean ? "Kafka를 감사 로그에 사용한 이유는 무엇입니까?" : "Why did you choose Kafka for audit logs?",
      label: isKorean ? "행동" : "Behavioral",
      score: 80,
    },
    {
      title: isKorean ? "데이터 정합성 이슈를 어떻게 복구했습니까?" : "How did you recover from a data consistency issue?",
      label: "System Design",
      score: 78,
    },
    {
      title: isKorean ? "정산 트랜잭션 서비스를 직접 작성해보세요." : "Write a service to process settlement transactions.",
      label: isKorean ? "코딩" : "Coding",
      score: 75,
    },
  ];

  const strengths = [
    { label: isKorean ? "백엔드 개발" : "Backend Development", score: 92, tone: "accent" },
    { label: isKorean ? "문제 해결" : "Problem Solving", score: 88, tone: "positive" },
    { label: isKorean ? "시스템 설계" : "System Design", score: 78, tone: "warning" },
    { label: isKorean ? "코드 품질" : "Code Quality", score: 75, tone: "purple" },
    { label: isKorean ? "오너십" : "Ownership", score: 70, tone: "indigo" },
  ];

  const weakAreas = [
    { label: isKorean ? "클라우드 아키텍처" : "Cloud Architecture", score: 65 },
    { label: isKorean ? "분산 시스템" : "Distributed Systems", score: 60 },
    { label: isKorean ? "성능 튜닝" : "Performance Tuning", score: 55 },
    { label: isKorean ? "고급 알고리즘" : "Advanced Algorithms", score: 50 },
    { label: isKorean ? "리더십" : "Leadership", score: 45 },
  ];

  const readinessTopics = [
    { label: isKorean ? "Core Java" : "Core Java", score: 90 },
    { label: isKorean ? "Spring Framework" : "Spring Framework", score: 85 },
    { label: isKorean ? "시스템 설계" : "System Design", score: 78 },
    { label: isKorean ? "데이터베이스(SQL)" : "Database (SQL)", score: 75 },
    { label: isKorean ? "분산 시스템" : "Distributed Systems", score: 65 },
    { label: isKorean ? "행동 질문" : "Behavioral", score: 80 },
  ];

  async function handleSaveProfile() {
    setProfileStatus(null);
    try {
      await updateProfileMutation.mutateAsync({
        nickname: nickname || undefined,
        jobRole: jobRole || undefined,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      });
      setProfileStatus(t("profile.saved"));
    } catch {
      return;
    }
  }

  async function handleUploadProfileImage(file: File) {
    setProfileImageStatus(null);
    try {
      await uploadProfileImageMutation.mutateAsync(file);
      setProfileImageStatus(t("profile.imageUploaded"));
    } catch {
      return;
    }
  }

  const profileModel = currentProfile;
  const targetCompanyCount = targetCompanies.length;
  const polygon = buildCareerPolygon(careerDna);

  return (
    <PageContainer
      description={
        isKorean
          ? "커리어 컨텍스트는 이력서 source of truth와 목표 회사 기준을 한 화면에서 묶는 작업공간입니다."
          : "Career context is the workspace that ties resume source-of-truth and target-company context together in one screen."
      }
      eyebrow={isKorean ? "커리어 작업공간" : "Career workspace"}
      title={isKorean ? "커리어 컨텍스트를 한 화면에서 정리하세요" : "Organize your career context in one screen"}
    >
      {currentUserQuery.isLoading ? (
        <LoadingStateCard body={t("profile.loadingBody")} title={t("profile.loadingTitle")} />
      ) : null}

      {currentUserQuery.isError ? (
        <ErrorStateCard
          body={userFacingErrorMessage(currentUserQuery.error, t("profile.loadErrorBody"))}
          details={getErrorDetails(currentUserQuery.error)}
          onAction={() => {
            void currentUserQuery.refetch();
          }}
          title={t("profile.loadErrorTitle")}
        />
      ) : null}

      {!currentUserQuery.isLoading && !currentUserQuery.isError && profileModel ? (
        <div className="page-stack career-context-workspace">
          <section className="career-context-workspace__shell">
            <header className="career-context-workspace__header">
              <div className="career-context-workspace__title-block">
                <p className="career-context-workspace__kicker">{isKorean ? "커리어 컨텍스트" : "Career context"}</p>
                <h2 className="career-context-workspace__title">
                  {isKorean ? "면접 전에 방어할 경력 맥락과 프로젝트 근거를 한 번에 보세요" : "See the project evidence and career context you need to defend before the interview"}
                </h2>
                <p className="career-context-workspace__body">
                  {isKorean
                    ? "이 화면은 정체성 편집보다 중요합니다. 이력서에 적은 주장과 실제 프로젝트 근거, 관련 질문, 준비도를 한 흐름으로 묶어야 합니다."
                    : "This screen matters more than identity editing. It should bind resume claims, project evidence, related questions, and readiness into one flow."}
                </p>
              </div>
              <div className="career-context-workspace__actions">
                <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
                  {isKorean ? "이력서 열기" : "Open resume"}
                </Link>
                <Link className="secondary-button" to={routeConfig.settings.buildPath()}>
                  {isKorean ? "설정 열기" : "Open settings"}
                </Link>
                <Link className="primary-button" to={routeConfig.interview.buildPath()}>
                  {isKorean ? "면접 세션 열기" : "Open interview session"}
                </Link>
              </div>
            </header>

            <section className="career-context-workspace__stats">
              <article className="career-kpi-card">
                <span>{isKorean ? "현재 역할" : "Current role"}</span>
                <strong>{roleLabel}</strong>
                <p>{targetCompanies[0] ?? "Dreamus"}</p>
                <small>{isKorean ? "2022년 5월 - 현재" : "May 2022 - Present"}</small>
              </article>
              <article className="career-kpi-card career-kpi-card--ring">
                <span>{isKorean ? "경력" : "Experience"}</span>
                <div className="career-kpi-card__ring-row">
                  <strong>{experienceYears > 0 ? experienceYears.toFixed(1) : "0.0"}</strong>
                  <div className="career-kpi-card__ring">
                    <svg viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" />
                      <circle
                        className="career-kpi-card__ring-progress"
                        cx="18"
                        cy="18"
                        r="14"
                        strokeDasharray={`${Math.min(99, Math.round(experienceYears * 12))} 100`}
                      />
                    </svg>
                  </div>
                </div>
                <p>{isKorean ? "년" : "Years"}</p>
              </article>
              <article className="career-kpi-card">
                <span>{isKorean ? "목표 역할" : "Target role"}</span>
                <strong>{targetRoleLabel}</strong>
                <p>{isKorean ? "다음 레벨" : "Next level"}</p>
              </article>
              <article className="career-kpi-card">
                <span>{isKorean ? "목표 회사" : "Target companies"}</span>
                <div className="career-company-badges">
                  {(targetCompanies.length > 0 ? targetCompanies : ["Amazon", "Netflix", "Google", "+2"]).slice(0, 4).map((company) => (
                    <span className="career-company-badges__item" key={company}>{company === "+2" ? "+2" : getCompanyBadge(company)}</span>
                  ))}
                </div>
                <p>{isKorean ? `${targetCompanyCount || 4}개 회사` : `${targetCompanyCount || 4} companies`}</p>
              </article>
              <article className="career-kpi-card">
                <span>{isKorean ? "이력서 상태" : "Resume status"}</span>
                <strong>{currentProfile?.profileImageFileName ? "v4" : "v3"}</strong>
                <p>{isKorean ? `합격선 ${scoreThresholdLabel}` : `Pass line ${scoreThresholdLabel}`}</p>
                <small>{isKorean ? `일일 질문 ${normalizedDailyQuestionCount}개` : `${normalizedDailyQuestionCount} daily questions`}</small>
              </article>
            </section>

            <div className="career-context-workspace__main">
              <section className="career-context-board">
                <article className="career-panel career-panel--dna">
                  <div className="career-panel__header">
                    <h3>{isKorean ? "Career DNA" : "Career DNA"}</h3>
                  </div>
                  <div className="career-dna-chart">
                    <svg className="career-dna-chart__svg" viewBox="-8 -8 116 116" aria-hidden="true">
                      {[14, 24, 34, 44].map((radius) => (
                        <polygon
                          className="career-dna-chart__ring"
                          key={radius}
                          points={careerDna.map((_, index) => {
                            const point = polarPoint(index, careerDna.length, radius);
                            return `${point.x},${point.y}`;
                          }).join(" ")}
                        />
                      ))}
                      {careerDna.map((point, index) => {
                        const outer = polarPoint(index, careerDna.length, 44);
                        const label = polarPoint(index, careerDna.length, 54);
                        return (
                          <g key={point.label}>
                            <line className="career-dna-chart__axis" x1="50" y1="50" x2={outer.x} y2={outer.y} />
                            <text
                              className="career-dna-chart__label"
                              textAnchor={label.x > 58 ? "start" : label.x < 42 ? "end" : "middle"}
                              x={label.x}
                              y={label.y}
                            >
                              {point.label}
                            </text>
                            <text className="career-dna-chart__score" x={label.x} y={label.y + 7} textAnchor={label.x > 58 ? "start" : label.x < 42 ? "end" : "middle"}>
                              {point.score}
                            </text>
                          </g>
                        );
                      })}
                      <polygon className="career-dna-chart__shape" points={polygon} />
                    </svg>
                    <div className="career-dna-chart__legend">
                      <span>{isKorean ? "나" : "You"}</span>
                      <span>{isKorean ? "산업 평균" : "Industry avg."}</span>
                    </div>
                  </div>
                </article>

                <article className="career-panel">
                  <div className="career-panel__header">
                    <h3>{isKorean ? "경력 및 임팩트 타임라인" : "Experience & Impact Timeline"}</h3>
                  </div>
                  <div className="career-timeline">
                    {timeline.map((item) => (
                      <article className="career-timeline__item" key={item.id}>
                        <span className={`career-timeline__dot career-timeline__dot--${item.tone}`} />
                        <div className="career-timeline__content">
                          <span className="career-timeline__period">{item.period}</span>
                          <strong>{item.company}</strong>
                          <em>{item.role}</em>
                          <div className="career-tag-row">
                            {item.tags.map((tag) => (
                              <span className="career-tag" key={tag}>{tag}</span>
                            ))}
                          </div>
                          <p>{item.body}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </article>

                <article className="career-panel">
                  <div className="career-panel__header">
                    <h3>{isKorean ? "핵심 프로젝트" : "Key Projects"}</h3>
                  </div>
                  <div className="career-project-list">
                    {projectCards.map((project) => (
                      <article className="career-project-card" key={project.id}>
                        <div className="career-project-card__top">
                          <div>
                            <strong>{project.title}</strong>
                            <span>{project.period}</span>
                          </div>
                          {project.featured ? <span className="detail-chip detail-chip--accent">{isKorean ? "주요" : "Featured"}</span> : null}
                        </div>
                        <p>{project.body}</p>
                        <div className="career-tag-row">
                          {project.tags.map((tag) => (
                            <span className="career-tag" key={tag}>{tag}</span>
                          ))}
                        </div>
                        <small>{project.impact}</small>
                      </article>
                    ))}
                  </div>
                </article>
              </section>

              <aside className="career-context-inspector">
                <article className="career-panel career-panel--inspector">
                  <div className="career-panel__header career-panel__header--tight">
                    <span className="career-context-inspector__label">{isKorean ? "프로젝트 상세" : "Project Detail"}</span>
                    <h3>{featuredProject.title}</h3>
                    <div className="career-context-inspector__meta">
                      <span className="detail-chip detail-chip--accent">{isKorean ? "주요 프로젝트" : "Featured project"}</span>
                      <span>{featuredProject.period}</span>
                    </div>
                  </div>
                  <div className="career-context-inspector__tabs">
                    <button className="career-context-inspector__tab career-context-inspector__tab--active" type="button">
                      {isKorean ? "개요" : "Overview"}
                    </button>
                    <button className="career-context-inspector__tab" type="button">
                      {isKorean ? "기술 스택" : "Tech Stack"}
                    </button>
                    <button className="career-context-inspector__tab" type="button">
                      {isKorean ? "지표" : "Metrics"}
                    </button>
                  </div>
                  <p className="career-context-inspector__body">
                    {isKorean
                      ? "감사 로그, 정산 정합성, 리포팅까지 한 흐름으로 설명해야 하는 프로젝트입니다. 면접에서는 설계 선택과 복구 전략을 반드시 묻습니다."
                      : "This project ties audit logs, settlement consistency, and reporting into one story. Interviews will probe both architecture choices and recovery strategy."}
                  </p>
                  <div className="career-context-inspector__section">
                    <strong>{isKorean ? "핵심 기여" : "Key Contributions"}</strong>
                    <ul className="career-context-inspector__bullet-list">
                      <li>{isKorean ? "마이크로서비스 기반의 확장 가능한 구조 설계" : "Designed a scalable architecture with microservices."}</li>
                      <li>{isKorean ? "멱등한 트랜잭션 처리와 복구 경로 구현" : "Implemented idempotent transaction processing and recovery paths."}</li>
                      <li>{isKorean ? "Kafka와 MySQL 기반 감사 로그 시스템 구축" : "Built an audit log system with Kafka and MySQL."}</li>
                      <li>{isKorean ? "시스템 안정성을 99.9% 수준으로 개선" : "Improved system reliability to 99.9% uptime."}</li>
                    </ul>
                  </div>
                  <div className="career-context-inspector__section">
                    <div className="career-context-inspector__section-head">
                      <strong>{isKorean ? "관련 면접 질문" : "Related Interview Questions"}</strong>
                      <span>{relatedQuestions.length}</span>
                    </div>
                    <div className="career-context-inspector__question-list">
                      {relatedQuestions.map((question, index) => (
                        <article className="career-context-inspector__question" key={question.title}>
                          <span className="career-context-inspector__question-order">{index + 1}</span>
                          <div>
                            <strong>{question.title}</strong>
                            <span>{question.label}</span>
                          </div>
                          <b>{question.score}</b>
                        </article>
                      ))}
                    </div>
                  </div>
                  <Link className="primary-button" to={routeConfig.practice.buildPath()}>
                    {isKorean ? "이 프로젝트로 연습하기" : "Practice this project"}
                  </Link>
                </article>
              </aside>
            </div>

            <section className="career-context-workspace__summary">
              <article className="career-summary-card">
                <h3>{isKorean ? "강점" : "Strengths"}</h3>
                <div className="career-summary-card__list">
                  {strengths.map((item) => (
                    <div className="career-summary-card__metric-row" key={item.label}>
                      <span>{item.label}</span>
                      <div className={`career-summary-card__score career-summary-card__score--${item.tone}`}>{item.score}</div>
                    </div>
                  ))}
                </div>
              </article>
              <article className="career-summary-card">
                <h3>{isKorean ? "약한 영역" : "Weak Areas"}</h3>
                <div className="career-summary-card__list">
                  {weakAreas.map((item) => (
                    <div className="career-summary-card__metric-row" key={item.label}>
                      <span>{item.label}</span>
                      <div className="career-summary-card__score career-summary-card__score--danger">{item.score}</div>
                    </div>
                  ))}
                </div>
              </article>
              <article className="career-summary-card career-summary-card--wide">
                <h3>{isKorean ? "주제별 면접 준비도" : "Interview Readiness by Topic"}</h3>
                <div className="career-readiness-list">
                  {readinessTopics.map((topic) => (
                    <div className="career-readiness-list__row" key={topic.label}>
                      <span>{topic.label}</span>
                      <div className="career-readiness-list__track">
                        <span style={{ width: `${topic.score}%` }} />
                      </div>
                      <strong>{topic.score}</strong>
                    </div>
                  ))}
                </div>
                <Link className="tertiary-link" to={routeConfig.skills.buildPath()}>
                  {isKorean ? "전체 주제 보기" : "View all topics"}
                </Link>
              </article>
            </section>
          </section>

          <section className="career-operations-deck">
            <ProfileSummaryCard
              imageErrorDetails={getErrorDetails(uploadProfileImageMutation.error)}
              imageErrorMessage={optionalErrorMessage(uploadProfileImageMutation.error, t("common.requestFailedBody"))}
              imageStatusMessage={profileImageStatus}
              isUploadingImage={uploadProfileImageMutation.isPending}
              onImageSelect={(file) => {
                void handleUploadProfileImage(file);
              }}
              profile={profileModel}
            />

            <ProfileEditForm
              className="page-card--embedded"
              errorDetails={getErrorDetails(updateProfileMutation.error)}
              errorMessage={optionalErrorMessage(updateProfileMutation.error, t("common.requestFailedBody"))}
              isPending={updateProfileMutation.isPending}
              jobRole={jobRole}
              nickname={nickname}
              onJobRoleChange={setJobRole}
              onNicknameChange={setNickname}
              onSubmit={() => {
                void handleSaveProfile();
              }}
              onYearsOfExperienceChange={setYearsOfExperience}
              statusMessage={profileStatus}
              yearsOfExperience={yearsOfExperience}
            />

            <article className="page-card career-operations-card">
              <div className="career-operations-card__header">
                <h3>{isKorean ? "연결된 작업공간" : "Connected Workspaces"}</h3>
                <p>
                  {isKorean
                    ? `언어 ${languageLabel} · 일일 질문 ${normalizedDailyQuestionCount}개 · 목표 점수 ${scoreThresholdLabel}`
                    : `Language ${languageLabel} · ${normalizedDailyQuestionCount} daily questions · target ${scoreThresholdLabel}`}
                </p>
              </div>
              <div className="career-operations-card__grid">
                <Link className="career-operations-card__link" to={routeConfig.resume.buildPath()}>
                  <strong>{isKorean ? "이력서 분석" : "Resume Analysis"}</strong>
                  <span>{isKorean ? "source of truth를 다시 검토하고 방어 가능한 주장만 남깁니다." : "Recheck source-of-truth and keep only defensible claims."}</span>
                </Link>
                <Link className="career-operations-card__link" to={routeConfig.skills.buildPath()}>
                  <strong>{isKorean ? "스킬 지형" : "Skill Landscape"}</strong>
                  <span>{isKorean ? "경력 맥락과 스킬 신호를 연결해 다음 DFS 연습 대상을 고릅니다." : "Connect career context to skill signals to pick the next DFS target."}</span>
                </Link>
              </div>
            </article>
          </section>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default ProfilePage;
