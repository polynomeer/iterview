package com.example.interviewplatform.common.ratelimit

import com.example.interviewplatform.auth.service.TokenService
import com.example.interviewplatform.support.ApiIntegrationTest
import com.example.interviewplatform.support.TestDatabaseCleaner
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@ApiIntegrationTest
@TestPropertySource(properties = ["app.rate-limits.generation.max-requests=2"])
class RequestRateLimitApiIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var tokenService: TokenService

    @BeforeEach
    fun setUp() {
        TestDatabaseCleaner.reset(jdbcTemplate)
        jdbcTemplate.update(
            """
            INSERT INTO users (id, email, password_hash, provider, provider_user_id, status, created_at, updated_at)
            VALUES (41, 'limited-user@example.com', NULL, 'local', NULL, 'ACTIVE', now(), now())
            """.trimIndent(),
        )
    }

    @Test
    fun `answers past the generation budget get 429 with a localized message`() {
        val authHeader = "Bearer ${tokenService.issueToken(41, "limited-user@example.com")}"
        val categoryId = jdbcTemplate.queryForObject("SELECT id FROM categories WHERE name = 'System Design'", Long::class.java)
        val questionId = jdbcTemplate.queryForObject(
            """
            INSERT INTO questions (
                category_id, title, body, question_type, difficulty_level, source_type, quality_status, visibility,
                expected_answer_seconds, is_active, created_at, updated_at
            ) VALUES (?, 'Rate limited question', 'Body', 'technical', 'MEDIUM', 'catalog', 'approved', 'public', 300, true, now(), now())
            RETURNING id
            """.trimIndent(),
            Long::class.java,
            categoryId,
        )
        val answer = { post("/api/questions/$questionId/answers")
            .header("Authorization", authHeader)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"answerMode":"text","contentText":"멱등 키로 중복을 막았습니다."}""") }

        repeat(2) { mockMvc.perform(answer()).andExpect(status().isOk) }

        mockMvc.perform(answer())
            .andExpect(status().isTooManyRequests)
            .andExpect(header().exists("Retry-After"))
            .andExpect(jsonPath("$.error.code").value("RATE_LIMITED"))
            .andExpect(jsonPath("$.error.message").value("요청이 너무 많아요. 60분 뒤에 다시 시도하세요."))
    }
}
