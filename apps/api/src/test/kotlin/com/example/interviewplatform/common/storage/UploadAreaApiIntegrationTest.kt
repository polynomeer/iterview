package com.example.interviewplatform.common.storage

import com.example.interviewplatform.support.ApiIntegrationTest
import com.example.interviewplatform.support.TestDatabaseCleaner
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate

@ApiIntegrationTest
class UploadAreaApiIntegrationTest {
    @Autowired
    private lateinit var areas: List<UploadArea>

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @BeforeEach
    fun setUp() {
        TestDatabaseCleaner.reset(jdbcTemplate)
    }

    @Test
    fun `every upload area reads its references from the database as keys under its root`() {
        jdbcTemplate.update(
            """
            INSERT INTO users (id, email, password_hash, provider, provider_user_id, status, created_at, updated_at)
            VALUES (7, 'storage@example.com', NULL, 'local', NULL, 'ACTIVE', now(), now())
            """.trimIndent(),
        )
        jdbcTemplate.update(
            """
            INSERT INTO user_profiles (user_id, nickname, profile_image_url, created_at, updated_at)
            VALUES (7, 'storage', '/uploads/profile-images/user-7-a.png', now(), now())
            """.trimIndent(),
        )
        val resumeId = jdbcTemplate.queryForObject(
            "INSERT INTO resumes (user_id, title, is_primary, created_at, updated_at) VALUES (7, 'r', true, now(), now()) RETURNING id",
            Long::class.java,
        )
        jdbcTemplate.update(
            """
            INSERT INTO resume_versions (resume_id, version_no, storage_key, parsing_status, is_active, uploaded_at, created_at)
            VALUES (?, 1, 'user-7/resume-1/resume-v1.pdf', 'completed', true, now(), now())
            """.trimIndent(),
            resumeId,
        )

        val byName = areas.associateBy { it.name }
        assertEquals(setOf("resume-files", "profile-images", "interview-audio", "resume-analysis-exports"), byName.keys)
        assertTrue("user-7/resume-1/resume-v1.pdf" in byName.getValue("resume-files").referencedKeys())
        assertTrue("user-7-a.png" in byName.getValue("profile-images").referencedKeys())
        byName.values.forEach { area -> area.referencedKeys() }
        assertTrue(byName.getValue("resume-files").root.toString().startsWith("build/test-uploads"))
    }
}
