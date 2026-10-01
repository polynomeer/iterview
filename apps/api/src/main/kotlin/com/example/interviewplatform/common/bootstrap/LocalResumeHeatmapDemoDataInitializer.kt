package com.example.interviewplatform.common.bootstrap

import com.example.interviewplatform.common.service.ClockService
import com.example.interviewplatform.interview.entity.InterviewRecordAnswerEntity
import com.example.interviewplatform.interview.entity.InterviewRecordEntity
import com.example.interviewplatform.interview.entity.InterviewRecordFollowUpEdgeEntity
import com.example.interviewplatform.interview.entity.InterviewRecordQuestionEntity
import com.example.interviewplatform.interview.repository.InterviewRecordAnswerRepository
import com.example.interviewplatform.interview.repository.InterviewRecordFollowUpEdgeRepository
import com.example.interviewplatform.interview.repository.InterviewRecordQuestionRepository
import com.example.interviewplatform.interview.repository.InterviewRecordRepository
import com.example.interviewplatform.interview.service.InterviewAudioStorageService
import com.example.interviewplatform.resume.entity.ResumeEntity
import com.example.interviewplatform.resume.entity.ResumeProfileSnapshotEntity
import com.example.interviewplatform.resume.entity.ResumeProjectSnapshotEntity
import com.example.interviewplatform.resume.entity.ResumeProjectTagEntity
import com.example.interviewplatform.resume.entity.ResumeQuestionHeatmapLinkEntity
import com.example.interviewplatform.resume.entity.ResumeVersionEntity
import com.example.interviewplatform.resume.repository.ResumeDocumentOverlayTargetRepository
import com.example.interviewplatform.resume.repository.ResumeProfileSnapshotRepository
import com.example.interviewplatform.resume.repository.ResumeProjectSnapshotRepository
import com.example.interviewplatform.resume.repository.ResumeProjectTagRepository
import com.example.interviewplatform.resume.repository.ResumeQuestionHeatmapLinkRepository
import com.example.interviewplatform.resume.repository.ResumeRepository
import com.example.interviewplatform.resume.repository.ResumeVersionRepository
import com.example.interviewplatform.resume.service.ResumeDocumentOverlayTargetBuilder
import com.example.interviewplatform.user.entity.UserEntity
import com.example.interviewplatform.user.enums.UserStatus
import com.example.interviewplatform.user.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.nio.file.Files
import java.time.LocalDate

@Component
@Profile("local")
class LocalResumeHeatmapDemoDataInitializer(
    private val userRepository: UserRepository,
    private val resumeRepository: ResumeRepository,
    private val resumeVersionRepository: ResumeVersionRepository,
    private val resumeProfileSnapshotRepository: ResumeProfileSnapshotRepository,
    private val resumeProjectSnapshotRepository: ResumeProjectSnapshotRepository,
    private val resumeProjectTagRepository: ResumeProjectTagRepository,
    private val resumeDocumentOverlayTargetRepository: ResumeDocumentOverlayTargetRepository,
    private val resumeQuestionHeatmapLinkRepository: ResumeQuestionHeatmapLinkRepository,
    private val interviewRecordRepository: InterviewRecordRepository,
    private val interviewRecordQuestionRepository: InterviewRecordQuestionRepository,
    private val interviewRecordAnswerRepository: InterviewRecordAnswerRepository,
    private val interviewRecordFollowUpEdgeRepository: InterviewRecordFollowUpEdgeRepository,
    private val resumeDocumentOverlayTargetBuilder: ResumeDocumentOverlayTargetBuilder,
    private val passwordEncoder: PasswordEncoder,
    private val clockService: ClockService,
    private val interviewAudioStorageService: InterviewAudioStorageService,
    private val jdbcTemplate: JdbcTemplate,
) : ApplicationRunner {

    @Transactional
    override fun run(args: ApplicationArguments) {
        val user = userRepository.findByEmail(DEMO_EMAIL) ?: seedDemoUser()
        val existingResume = resumeRepository.findByUserIdOrderByCreatedAtDesc(user.id)
            .firstOrNull { it.title == DEMO_RESUME_TITLE }
        if (existingResume != null && resumeVersionRepository.findByResumeIdOrderByVersionNoAsc(existingResume.id).isNotEmpty()) {
            logger.info(
                "Local heatmap demo data already present. Login with {} / {} and inspect the resume titled '{}'.",
                DEMO_EMAIL,
                DEMO_PASSWORD,
                DEMO_RESUME_TITLE,
            )
            ensureDemoRecording(user.id)
            return
        }

        val now = clockService.now()
        val resume = existingResume ?: resumeRepository.save(
            ResumeEntity(
                userId = user.id,
                title = DEMO_RESUME_TITLE,
                isPrimary = true,
                createdAt = now,
                updatedAt = now,
            ),
        )
        val version = resumeVersionRepository.save(
            ResumeVersionEntity(
                resumeId = resume.id,
                versionNo = 1,
                fileUrl = null,
                fileName = "heatmap-overlay-demo.pdf",
                fileType = "application/pdf",
                storageKey = null,
                fileSizeBytes = null,
                checksumSha256 = null,
                rawText = DEMO_RAW_TEXT,
                parsedJson = null,
                summaryText = DEMO_SUMMARY,
                parsingStatus = "completed",
                parseStartedAt = now.minusSeconds(300),
                parseCompletedAt = now.minusSeconds(240),
                parseErrorMessage = null,
                llmExtractionStatus = "completed",
                llmExtractionStartedAt = now.minusSeconds(210),
                llmExtractionCompletedAt = now.minusSeconds(180),
                llmExtractionErrorMessage = null,
                llmModel = "local-demo",
                llmPromptVersion = "demo-v1",
                llmExtractionConfidence = BigDecimal("0.9800"),
                isActive = true,
                uploadedAt = now.minusSeconds(360),
                createdAt = now.minusSeconds(360),
            ),
        )

        resumeProfileSnapshotRepository.save(
            ResumeProfileSnapshotEntity(
                resumeVersionId = version.id,
                fullName = "Jacob Ham",
                headline = "Backend Platform Engineer",
                summaryText = DEMO_SUMMARY,
                locationText = "Seoul",
                yearsOfExperienceText = "7 years",
                sourceText = DEMO_SUMMARY,
                createdAt = now,
                updatedAt = now,
            ),
        )

        val mainProject = resumeProjectSnapshotRepository.save(
            ResumeProjectSnapshotEntity(
                resumeVersionId = version.id,
                title = "크리에이터 스튜디오 개발",
                organizationName = "(주)드림어스컴퍼니(FLO)",
                roleName = "Backend Engineer",
                summaryText = "콘텐츠 라이프사이클 파이프라인 구조화 및 운영 안정화",
                contentText = """
                    Java11, Spring Boot, QueryDSL
                    B2C 오디오 콘텐츠 제작 플랫폼 크리에이터 스튜디오를 신규 구축하여 누구나 쉽게 오디오 콘텐츠를 제작하고 FLO에 배포할 수 있도록 지원
                    콘텐츠 라이프사이클 파이프라인 구조화 및 운영 안정화
                    업로드, 검증, 처리, CDN 반영, 서비스 연계까지 단계가 많아 실패 복구 가능한 End-to-End 파이프라인을 설계했습니다.
                """.trimIndent(),
                projectCategoryCode = "platform",
                projectCategoryName = "Platform",
                techStackText = "Java11, Spring Boot, QueryDSL, AWS RDS, Redis",
                startedOn = LocalDate.of(2024, 1, 1),
                endedOn = LocalDate.of(2024, 10, 31),
                displayOrder = 1,
                sourceText = """
                    크리에이터 스튜디오 개발 2024.01 ~ 2024.10
                    기술스택 Java11, Spring Boot, QueryDSL
                    B2C 오디오 콘텐츠 제작 플랫폼 크리에이터 스튜디오를 신규 구축하여 누구나 쉽게 오디오 콘텐츠를 제작하고 FLO에 배포할 수 있도록 지원
                    콘텐츠 라이프사이클 파이프라인 구조화 및 운영 안정화
                    업로드, 검증, 처리, CDN 반영, 서비스 연계까지 단계가 많아 실패 복구 가능한 End-to-End 파이프라인을 설계했습니다.
                """.trimIndent(),
                createdAt = now,
                updatedAt = now,
            ),
        )

        val secondaryProject = resumeProjectSnapshotRepository.save(
            ResumeProjectSnapshotEntity(
                resumeVersionId = version.id,
                title = "결제 안정화 플랫폼",
                organizationName = "FinOps Team",
                roleName = "Platform Engineer",
                summaryText = "Redis 캐시 전략과 정산 파이프라인을 재설계해 안정성을 높였습니다.",
                contentText = """
                    Redis 캐시 전략을 재설계하고 정산 재처리 파이프라인을 자동화했습니다.
                    재시도 비용과 데이터 정합성 문제를 줄이기 위해 상태 기반 복구 흐름을 만들었습니다.
                """.trimIndent(),
                projectCategoryCode = "payments",
                projectCategoryName = "Payments",
                techStackText = "Kotlin, Spring Boot, Redis, PostgreSQL",
                startedOn = LocalDate.of(2023, 3, 1),
                endedOn = LocalDate.of(2023, 12, 31),
                displayOrder = 2,
                sourceText = """
                    결제 안정화 플랫폼 2023.03 ~ 2023.12
                    Redis 캐시 전략을 재설계하고 정산 재처리 파이프라인을 자동화했습니다.
                    재시도 비용과 데이터 정합성 문제를 줄이기 위해 상태 기반 복구 흐름을 만들었습니다.
                """.trimIndent(),
                createdAt = now,
                updatedAt = now,
            ),
        )

        resumeProjectTagRepository.saveAll(
            listOf(
                ResumeProjectTagEntity(
                    resumeProjectSnapshotId = mainProject.id,
                    tagName = "End-to-End 파이프라인",
                    tagType = "theme",
                    displayOrder = 1,
                    sourceText = "End-to-End 파이프라인",
                    createdAt = now,
                    updatedAt = now,
                ),
                ResumeProjectTagEntity(
                    resumeProjectSnapshotId = mainProject.id,
                    tagName = "FLO",
                    tagType = "domain",
                    displayOrder = 2,
                    sourceText = "FLO",
                    createdAt = now,
                    updatedAt = now,
                ),
                ResumeProjectTagEntity(
                    resumeProjectSnapshotId = mainProject.id,
                    tagName = "Spring Boot",
                    tagType = "tech",
                    displayOrder = 3,
                    sourceText = "Spring Boot",
                    createdAt = now,
                    updatedAt = now,
                ),
                ResumeProjectTagEntity(
                    resumeProjectSnapshotId = secondaryProject.id,
                    tagName = "Redis",
                    tagType = "tech",
                    displayOrder = 1,
                    sourceText = "Redis",
                    createdAt = now,
                    updatedAt = now,
                ),
                ResumeProjectTagEntity(
                    resumeProjectSnapshotId = secondaryProject.id,
                    tagName = "정산",
                    tagType = "domain",
                    displayOrder = 2,
                    sourceText = "정산",
                    createdAt = now,
                    updatedAt = now,
                ),
            ),
        )

        val overlayTargets = resumeDocumentOverlayTargetBuilder.buildForVersion(
            resumeVersionId = version.id,
            profile = resumeProfileSnapshotRepository.findByResumeVersionId(version.id),
            competencies = emptyList(),
            skills = emptyList(),
            experiences = emptyList(),
            projects = resumeProjectSnapshotRepository.findByResumeVersionIdOrderByDisplayOrderAscIdAsc(version.id),
            now = now,
        )
        resumeDocumentOverlayTargetRepository.saveAll(overlayTargets)

        val mainRecord = interviewRecordRepository.save(
            InterviewRecordEntity(
                userId = user.id,
                companyName = "(주)드림어스컴퍼니(FLO)",
                roleName = "Backend Platform Engineer",
                interviewDate = LocalDate.of(2026, 3, 10),
                interviewType = "practical",
                rawTranscript = null,
                cleanedTranscript = null,
                confirmedTranscript = null,
                transcriptStatus = "confirmed",
                analysisStatus = "completed",
                linkedResumeVersionId = version.id,
                overallSummary = "Creator studio lifecycle and stability questions with one weak answer.",
                structuringStage = "confirmed",
                confirmedAt = now.minusSeconds(90),
                createdAt = now.minusSeconds(120),
                updatedAt = now.minusSeconds(60),
            ),
        )

        val broadQuestion = interviewRecordQuestionRepository.save(
            InterviewRecordQuestionEntity(
                interviewRecordId = mainRecord.id,
                text = "이 프로젝트에서 가장 어려웠던 점이 무엇이었나요?",
                normalizedText = "이 프로젝트에서 가장 어려웠던 점",
                questionType = "behavioral",
                topicTagsJson = """["project","difficulty"]""",
                intentTagsJson = """["experience"]""",
                derivedFromResumeSection = "project",
                derivedFromResumeRecordType = "project",
                derivedFromResumeRecordId = mainProject.id,
                orderIndex = 0,
                createdAt = now.minusSeconds(120),
                updatedAt = now.minusSeconds(120),
            ),
        )
        interviewRecordAnswerRepository.save(
            InterviewRecordAnswerEntity(
                interviewRecordQuestionId = broadQuestion.id,
                text = "가장 어려웠던 점은 업로드부터 배포까지 이어지는 처리 흐름을 실패해도 복구 가능한 구조로 만드는 것이었습니다.",
                normalizedText = "업로드부터 배포까지 이어지는 처리 흐름 복구 구조",
                summary = "End-to-End 파이프라인 복구 구조를 설계한 경험을 설명했습니다.",
                confidenceMarkersJson = "[]",
                weaknessTagsJson = "[]",
                strengthTagsJson = """["structured"]""",
                analysisJson = null,
                orderIndex = 0,
                createdAt = now.minusSeconds(119),
                updatedAt = now.minusSeconds(119),
            ),
        )

        val phraseQuestion = interviewRecordQuestionRepository.save(
            InterviewRecordQuestionEntity(
                interviewRecordId = mainRecord.id,
                text = "콘텐츠 라이프사이클 파이프라인 구조화 및 운영 안정화가 구체적으로 무엇이었나요?",
                normalizedText = "콘텐츠 라이프사이클 파이프라인 구조화 운영 안정화",
                questionType = "verification",
                topicTagsJson = """["pipeline","stability"]""",
                intentTagsJson = """["verification","pressure"]""",
                derivedFromResumeSection = "project",
                derivedFromResumeRecordType = "project",
                derivedFromResumeRecordId = mainProject.id,
                orderIndex = 1,
                createdAt = now.minusSeconds(118),
                updatedAt = now.minusSeconds(118),
            ),
        )
        interviewRecordAnswerRepository.save(
            InterviewRecordAnswerEntity(
                interviewRecordQuestionId = phraseQuestion.id,
                text = "업로드, 검증, 처리, CDN 반영, 서비스 연계 단계가 이어지기 때문에 상태 기반 복구 흐름과 단계별 책임을 분리했습니다.",
                normalizedText = "업로드 검증 처리 CDN 반영 서비스 연계 상태 기반 복구 흐름",
                summary = "파이프라인 단계별 책임 분리와 복구 흐름 설계를 설명했지만 수치 근거는 부족했습니다.",
                confidenceMarkersJson = """["uncertain"]""",
                weaknessTagsJson = """["missing_metric"]""",
                strengthTagsJson = """["tradeoff_aware"]""",
                analysisJson = null,
                orderIndex = 1,
                createdAt = now.minusSeconds(117),
                updatedAt = now.minusSeconds(117),
            ),
        )

        val followUpQuestion = interviewRecordQuestionRepository.save(
            InterviewRecordQuestionEntity(
                interviewRecordId = mainRecord.id,
                text = "그 구조에서 실패 복구를 위해 어떤 상태 전이를 두셨나요?",
                normalizedText = "실패 복구 상태 전이",
                questionType = "follow_up",
                topicTagsJson = """["pipeline","recovery"]""",
                intentTagsJson = """["pressure"]""",
                derivedFromResumeSection = "project",
                derivedFromResumeRecordType = "project",
                derivedFromResumeRecordId = mainProject.id,
                parentQuestionId = phraseQuestion.id,
                orderIndex = 2,
                createdAt = now.minusSeconds(116),
                updatedAt = now.minusSeconds(116),
            ),
        )
        interviewRecordAnswerRepository.save(
            InterviewRecordAnswerEntity(
                interviewRecordQuestionId = followUpQuestion.id,
                text = "Draft, validating, published 같은 단계 상태를 분리하고 재처리 큐로 되돌릴 수 있게 설계했습니다.",
                normalizedText = "draft validating published 재처리 큐",
                summary = "상태 전이와 재처리 큐를 중심으로 복구 전략을 설명했습니다.",
                confidenceMarkersJson = "[]",
                weaknessTagsJson = "[]",
                strengthTagsJson = """["structured","tradeoff_aware"]""",
                analysisJson = null,
                orderIndex = 2,
                createdAt = now.minusSeconds(115),
                updatedAt = now.minusSeconds(115),
            ),
        )

        val keywordQuestion = interviewRecordQuestionRepository.save(
            InterviewRecordQuestionEntity(
                interviewRecordId = mainRecord.id,
                text = "Redis 캐시 전략을 왜 그렇게 설계했나요?",
                normalizedText = "redis 캐시 전략",
                questionType = "verification",
                topicTagsJson = """["redis","cache"]""",
                intentTagsJson = """["verification","pressure"]""",
                derivedFromResumeSection = "project",
                derivedFromResumeRecordType = "project",
                derivedFromResumeRecordId = secondaryProject.id,
                orderIndex = 3,
                createdAt = now.minusSeconds(114),
                updatedAt = now.minusSeconds(114),
            ),
        )
        interviewRecordAnswerRepository.save(
            InterviewRecordAnswerEntity(
                interviewRecordQuestionId = keywordQuestion.id,
                text = "정산 재처리가 많은 구간이라 캐시 일관성과 재처리 비용을 같이 보면서 TTL과 invalidation 흐름을 잡았습니다.",
                normalizedText = "캐시 일관성 재처리 비용 TTL invalidation",
                summary = "Redis 캐시 전략과 정산 재처리 관점을 연결해 답변했습니다.",
                confidenceMarkersJson = "[]",
                weaknessTagsJson = """["missing_metric"]""",
                strengthTagsJson = """["tradeoff_aware","detailed"]""",
                analysisJson = null,
                orderIndex = 3,
                createdAt = now.minusSeconds(113),
                updatedAt = now.minusSeconds(113),
            ),
        )
        interviewRecordFollowUpEdgeRepository.save(
            InterviewRecordFollowUpEdgeEntity(
                interviewRecordId = mainRecord.id,
                fromQuestionId = phraseQuestion.id,
                toQuestionId = followUpQuestion.id,
                relationType = "drill_down",
                triggerType = "manual",
                createdAt = now.minusSeconds(112),
            ),
        )

        val olderRecord = interviewRecordRepository.save(
            InterviewRecordEntity(
                userId = user.id,
                companyName = "카카오",
                roleName = "Platform Engineer",
                interviewDate = LocalDate.of(2026, 1, 20),
                interviewType = "practical",
                rawTranscript = null,
                cleanedTranscript = null,
                confirmedTranscript = null,
                transcriptStatus = "confirmed",
                analysisStatus = "completed",
                linkedResumeVersionId = version.id,
                overallSummary = "Older interview for company/date filtering demo.",
                structuringStage = "confirmed",
                confirmedAt = now.minusSeconds(80),
                createdAt = now.minusSeconds(100),
                updatedAt = now.minusSeconds(70),
            ),
        )
        val olderQuestion = interviewRecordQuestionRepository.save(
            InterviewRecordQuestionEntity(
                interviewRecordId = olderRecord.id,
                text = "FLO 배포 파이프라인을 운영하면서 가장 자주 본 장애는 무엇이었나요?",
                normalizedText = "flo 배포 파이프라인 장애",
                questionType = "behavioral",
                topicTagsJson = """["pipeline","operations"]""",
                intentTagsJson = """["experience"]""",
                derivedFromResumeSection = "project",
                derivedFromResumeRecordType = "project",
                derivedFromResumeRecordId = mainProject.id,
                orderIndex = 0,
                createdAt = now.minusSeconds(99),
                updatedAt = now.minusSeconds(99),
            ),
        )
        interviewRecordAnswerRepository.save(
            InterviewRecordAnswerEntity(
                interviewRecordQuestionId = olderQuestion.id,
                text = "검증 이후 반영 단계에서 중간 실패가 나는 경우가 있었고, 재처리 큐와 운영 대시보드로 대응했습니다.",
                normalizedText = "검증 이후 반영 단계 중간 실패 재처리 큐 운영 대시보드",
                summary = "운영 장애와 복구 흐름을 간단히 설명했습니다.",
                confidenceMarkersJson = "[]",
                weaknessTagsJson = "[]",
                strengthTagsJson = """["detailed"]""",
                analysisJson = null,
                orderIndex = 0,
                createdAt = now.minusSeconds(98),
                updatedAt = now.minusSeconds(98),
            ),
        )

        val sentenceTarget = resumeDocumentOverlayTargetRepository.findByResumeVersionIdOrderByDisplayOrderAscIdAsc(version.id)
            .firstOrNull { target ->
                target.anchorType == "project" &&
                    target.anchorRecordId == mainProject.id &&
                    target.targetType == "sentence" &&
                    target.fieldPath == "project.sourceText" &&
                    target.textSnippet.contains("콘텐츠 라이프사이클 파이프라인 구조화")
            }

        if (sentenceTarget != null) {
            resumeQuestionHeatmapLinkRepository.save(
                ResumeQuestionHeatmapLinkEntity(
                    userId = user.id,
                    resumeVersionId = version.id,
                    interviewRecordQuestionId = phraseQuestion.id,
                    anchorType = "project",
                    anchorRecordId = mainProject.id,
                    anchorKey = null,
                    overlayTargetType = sentenceTarget.targetType,
                    overlayFieldPath = sentenceTarget.fieldPath,
                    overlaySentenceIndex = sentenceTarget.sentenceIndex,
                    overlayTextSnippet = sentenceTarget.textSnippet,
                    linkSource = "manual",
                    confidenceScore = BigDecimal("0.9900"),
                    active = true,
                    createdAt = now.minusSeconds(50),
                    updatedAt = now.minusSeconds(50),
                ),
            )
        }

        logger.info(
            "Seeded local heatmap demo data. Login with {} / {} and inspect resume '{}' via /api/resumes then /api/resume-versions/{}/question-heatmap.",
            DEMO_EMAIL,
            DEMO_PASSWORD,
            DEMO_RESUME_TITLE,
            version.id,
        )
        ensureDemoRecording(user.id)
    }

    /**
     * Gives the main demo interview a recording and transcript segments, one question and one answer turn
     * per question, so the review player has something to play. Runs on every start and only fills what
     * is missing, so databases seeded before this existed get it too.
     */
    private fun ensureDemoRecording(userId: Long) {
        val recordId = jdbcTemplate.queryForList(
            "SELECT id FROM interview_records WHERE user_id = ? AND company_name = ? AND interview_date = ? ORDER BY id LIMIT 1",
            Long::class.java,
            userId,
            DEMO_RECORDED_COMPANY,
            LocalDate.of(2026, 3, 10),
        ).firstOrNull() ?: return
        val hasSegments = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM interview_transcript_segments WHERE interview_record_id = ?",
            Int::class.java,
            recordId,
        )!! > 0
        val questions = jdbcTemplate.queryForList(
            "SELECT id, text FROM interview_record_questions WHERE interview_record_id = ? ORDER BY order_index, id",
            recordId,
        )
        if (hasSegments || questions.isEmpty()) {
            return
        }

        val storageKey = "demo-interview-$recordId.wav"
        val path = interviewAudioStorageService.resolveStoredPath(storageKey)
        Files.createDirectories(path.parent)
        Files.write(path, DemoInterviewRecording.wav(questions.size * 2))
        val now = clockService.now()
        jdbcTemplate.update(
            """
            UPDATE interview_records
            SET source_audio_file_url = ?, source_audio_file_name = ?, source_audio_duration_ms = ?, source_audio_content_type = 'audio/wav', updated_at = ?
            WHERE id = ?
            """.trimIndent(),
            "/uploads/interview-audio/$storageKey",
            "demo-interview.wav",
            questions.size * 2 * DemoInterviewRecording.SEGMENT_MS,
            java.sql.Timestamp.from(now),
            recordId,
        )
        questions.forEachIndexed { index, question ->
            val questionId = (question["id"] as Number).toLong()
            val answerText = jdbcTemplate.queryForList(
                "SELECT text FROM interview_record_answers WHERE interview_record_question_id = ? ORDER BY order_index, id",
                String::class.java,
                questionId,
            ).joinToString(" ")
            val questionSegment = insertSegment(recordId, index * 2, "interviewer", question["text"] as String, now)
            val answerSegment = insertSegment(recordId, index * 2 + 1, "candidate", answerText.ifBlank { "…" }, now)
            jdbcTemplate.update(
                "UPDATE interview_record_questions SET segment_start_id = ?, segment_end_id = ? WHERE id = ?",
                questionSegment,
                questionSegment,
                questionId,
            )
            jdbcTemplate.update(
                "UPDATE interview_record_answers SET segment_start_id = ?, segment_end_id = ? WHERE interview_record_question_id = ?",
                answerSegment,
                answerSegment,
                questionId,
            )
        }
        logger.info("Seeded a {}-turn demo recording for interview record {}.", questions.size * 2, recordId)
    }

    private fun insertSegment(recordId: Long, index: Int, speakerType: String, text: String, now: java.time.Instant): Long =
        jdbcTemplate.queryForObject(
            """
            INSERT INTO interview_transcript_segments (
                interview_record_id, start_ms, end_ms, speaker_type, raw_text, cleaned_text, confidence_score, sequence, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 95.00, ?, ?, ?)
            RETURNING id
            """.trimIndent(),
            Long::class.java,
            recordId,
            index * DemoInterviewRecording.SEGMENT_MS,
            (index + 1) * DemoInterviewRecording.SEGMENT_MS - 1,
            speakerType,
            text,
            text,
            index + 1,
            java.sql.Timestamp.from(now),
            java.sql.Timestamp.from(now),
        )!!

    private fun seedDemoUser(): UserEntity {
        val now = clockService.now()
        return userRepository.save(
            UserEntity(
                email = DEMO_EMAIL,
                passwordHash = passwordEncoder.encode(DEMO_PASSWORD),
                provider = "local",
                providerUserId = null,
                status = UserStatus.ACTIVE,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    private companion object {
        private val logger = LoggerFactory.getLogger(LocalResumeHeatmapDemoDataInitializer::class.java)
        private const val DEMO_EMAIL = "demo-heatmap@iterview.local"
        private const val DEMO_RECORDED_COMPANY = "(주)드림어스컴퍼니(FLO)"
        private const val DEMO_PASSWORD = "demo1234!"
        private const val DEMO_RESUME_TITLE = "Heatmap Overlay Demo Resume"
        private const val DEMO_SUMMARY =
            "콘텐츠 제작과 배포 파이프라인을 안정화하고, Redis 캐시 전략과 상태 기반 복구 흐름을 설계한 백엔드 플랫폼 엔지니어입니다."
        private const val DEMO_RAW_TEXT = """
Jacob Ham
Backend Platform Engineer

크리에이터 스튜디오 개발 2024.01 ~ 2024.10
기술스택 Java11, Spring Boot, QueryDSL
B2C 오디오 콘텐츠 제작 플랫폼 크리에이터 스튜디오를 신규 구축하여 누구나 쉽게 오디오 콘텐츠를 제작하고 FLO에 배포할 수 있도록 지원
콘텐츠 라이프사이클 파이프라인 구조화 및 운영 안정화
업로드, 검증, 처리, CDN 반영, 서비스 연계까지 단계가 많아 실패 복구 가능한 End-to-End 파이프라인을 설계했습니다.

결제 안정화 플랫폼 2023.03 ~ 2023.12
Redis 캐시 전략을 재설계하고 정산 재처리 파이프라인을 자동화했습니다.
재시도 비용과 데이터 정합성 문제를 줄이기 위해 상태 기반 복구 흐름을 만들었습니다.
"""
    }
}
