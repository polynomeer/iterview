package com.example.interviewplatform.common.bootstrap

import com.example.interviewplatform.resume.repository.ResumeRepository
import com.example.interviewplatform.resume.repository.ResumeVersionRepository
import com.example.interviewplatform.resume.service.ResumeQuestionHeatmapService
import com.example.interviewplatform.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.jdbc.core.JdbcTemplate
import com.example.interviewplatform.interview.service.InterviewAudioStorageService
import java.nio.file.Files
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.junit.jupiter.Testcontainers

@SpringBootTest
@ActiveProfiles("local", "test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
class LocalResumeHeatmapDemoDataInitializerTest {
    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var resumeRepository: ResumeRepository

    @Autowired
    private lateinit var resumeVersionRepository: ResumeVersionRepository

    @Autowired
    private lateinit var resumeQuestionHeatmapService: ResumeQuestionHeatmapService

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var interviewAudioStorageService: InterviewAudioStorageService

    @Test
    fun `local profile seeds heatmap demo data`() {
        val user = userRepository.findByEmail("demo-heatmap@iterview.local")
        assertNotNull(user)

        val resume = resumeRepository.findByUserIdOrderByCreatedAtDesc(user!!.id)
            .firstOrNull { it.title == "Heatmap Overlay Demo Resume" }
        assertNotNull(resume)

        val version = resumeVersionRepository.findTopByResumeIdOrderByVersionNoDesc(resume!!.id)
        assertNotNull(version)

        val heatmap = resumeQuestionHeatmapService.getHeatmap(
            userId = user.id,
            versionId = version!!.id,
            scope = "all",
        )

        assertTrue(heatmap.items.isNotEmpty())
        assertTrue(heatmap.filterSummary.totalQuestions >= 4)
        assertTrue(heatmap.filterSummary.distinctCompanyCount >= 2)
        assertTrue(heatmap.filterSummary.availableTargetTypes.isNotEmpty())

        val sentenceOnly = resumeQuestionHeatmapService.getOverlayTargets(
            userId = user.id,
            versionId = version.id,
            scope = "all",
            targetType = "sentence",
        )
        assertEquals("sentence", sentenceOnly.appliedFilters.targetType)
        assertTrue(sentenceOnly.items.all { it.targetType == "sentence" })
    }

    @Test
    fun `local profile gives the demo interview a playable recording and transcript turns`() {
        val record = jdbcTemplate.queryForMap(
            """
            SELECT r.id, r.source_audio_file_url, r.source_audio_duration_ms
            FROM interview_records r JOIN users u ON u.id = r.user_id
            WHERE u.email = 'demo-heatmap@iterview.local' AND r.interview_date = DATE '2026-03-10'
            """.trimIndent(),
        )
        val recordId = (record["id"] as Number).toLong()
        val url = record["source_audio_file_url"] as String
        assertTrue(url.startsWith("/uploads/interview-audio/demo-interview-"))
        val audio = Files.readAllBytes(interviewAudioStorageService.resolveStoredPath(url.removePrefix("/uploads/interview-audio/")))
        assertEquals("RIFF", String(audio, 0, 4))
        assertEquals("WAVE", String(audio, 8, 4))

        val questionCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM interview_record_questions WHERE interview_record_id = ?", Int::class.java, recordId)!!
        val segments = jdbcTemplate.queryForList(
            "SELECT speaker_type FROM interview_transcript_segments WHERE interview_record_id = ? ORDER BY sequence",
            String::class.java,
            recordId,
        )
        assertEquals(questionCount * 2, segments.size)
        assertEquals(listOf("interviewer", "candidate"), segments.take(2))
        assertEquals(questionCount * 2 * 7_500L, (record["source_audio_duration_ms"] as Number).toLong())
        val unlinked = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM interview_record_questions WHERE interview_record_id = ? AND segment_start_id IS NULL",
            Int::class.java,
            recordId,
        )
        assertEquals(0, unlinked)
    }
}
