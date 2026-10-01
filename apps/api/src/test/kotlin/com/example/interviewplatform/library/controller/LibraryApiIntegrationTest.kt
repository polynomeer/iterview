package com.example.interviewplatform.library.controller

import com.example.interviewplatform.auth.service.TokenService
import com.example.interviewplatform.support.ApiIntegrationTest
import com.example.interviewplatform.support.TestDatabaseCleaner
import org.hamcrest.Matchers.nullValue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@ApiIntegrationTest
class LibraryApiIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var tokenService: TokenService

    private lateinit var authHeader: String
    private lateinit var otherAuthHeader: String

    @BeforeEach
    fun setUp() {
        TestDatabaseCleaner.reset(jdbcTemplate)
        jdbcTemplate.update(
            """
            INSERT INTO users (id, email, password_hash, provider, provider_user_id, status, created_at, updated_at)
            VALUES (1, 'library-user@example.com', NULL, 'local', NULL, 'ACTIVE', now(), now()),
                   (2, 'other-user@example.com', NULL, 'local', NULL, 'ACTIVE', now(), now())
            """.trimIndent(),
        )
        authHeader = "Bearer ${tokenService.issueToken(1, "library-user@example.com")}"
        otherAuthHeader = "Bearer ${tokenService.issueToken(2, "other-user@example.com")}"
    }

    @Test
    fun `bookmarks and notes are saved per user and gathered with linked reading`() {
        val cacheQuestion = insertQuestion("What are cache-aside tradeoffs?")
        val queueQuestion = insertQuestion("How do you keep consumers idempotent?")
        val materialId = insertMaterial("Idempotency Keys in Distributed Systems")
        jdbcTemplate.update(
            "INSERT INTO question_learning_materials (question_id, learning_material_id, relevance_score, created_at) VALUES (?, ?, 0.9, now()), (?, ?, 0.5, now())",
            queueQuestion, materialId, cacheQuestion, materialId,
        )

        mockMvc.perform(get("/api/questions/$cacheQuestion/library-state").header("Authorization", authHeader))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.bookmarked").value(false))
            .andExpect(jsonPath("$.note").value(nullValue()))

        mockMvc.perform(put("/api/questions/$cacheQuestion/bookmark").header("Authorization", authHeader))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.bookmarked").value(true))
            .andExpect(jsonPath("$.bookmarkedAt").isNotEmpty)
        // Bookmarking twice is a no-op.
        mockMvc.perform(put("/api/questions/$cacheQuestion/bookmark").header("Authorization", authHeader))
            .andExpect(status().isOk)

        mockMvc.perform(
            put("/api/questions/$queueQuestion/note")
                .header("Authorization", authHeader)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"body":"  Use an idempotency key per message.  "}"""),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.note.body").value("Use an idempotency key per message."))

        mockMvc.perform(get("/api/library").header("Authorization", authHeader))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.bookmarks.length()").value(1))
            .andExpect(jsonPath("$.bookmarks[0].question.title").value("What are cache-aside tradeoffs?"))
            .andExpect(jsonPath("$.bookmarks[0].question.categoryName").value("System Design"))
            .andExpect(jsonPath("$.bookmarks[0].hasNote").value(false))
            .andExpect(jsonPath("$.notes.length()").value(1))
            .andExpect(jsonPath("$.notes[0].question.questionId").value(queueQuestion))
            .andExpect(jsonPath("$.notes[0].bookmarked").value(false))
            // The material appears once, under the saved question listed first.
            .andExpect(jsonPath("$.materials.length()").value(1))
            .andExpect(jsonPath("$.materials[0].title").value("Idempotency Keys in Distributed Systems"))
            .andExpect(jsonPath("$.materials[0].question.questionId").value(cacheQuestion))

        mockMvc.perform(get("/api/library").header("Authorization", otherAuthHeader))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.bookmarks.length()").value(0))
            .andExpect(jsonPath("$.notes.length()").value(0))

        mockMvc.perform(delete("/api/questions/$cacheQuestion/bookmark").header("Authorization", authHeader))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.bookmarked").value(false))
        mockMvc.perform(
            put("/api/questions/$queueQuestion/note")
                .header("Authorization", authHeader)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"body":"   "}"""),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.note").value(nullValue()))

        mockMvc.perform(get("/api/library").header("Authorization", authHeader))
            .andExpect(jsonPath("$.bookmarks.length()").value(0))
            .andExpect(jsonPath("$.notes.length()").value(0))
            .andExpect(jsonPath("$.materials.length()").value(0))
    }

    @Test
    fun `library endpoints require sign-in and an existing question`() {
        val questionId = insertQuestion("Any question")
        mockMvc.perform(get("/api/library")).andExpect(status().isUnauthorized)
        mockMvc.perform(put("/api/questions/$questionId/bookmark")).andExpect(status().isUnauthorized)
        mockMvc.perform(put("/api/questions/999999/bookmark").header("Authorization", authHeader))
            .andExpect(status().isNotFound)
    }

    private fun insertQuestion(title: String): Long {
        val categoryId = jdbcTemplate.queryForObject("SELECT id FROM categories WHERE name = 'System Design'", Long::class.java)
        return jdbcTemplate.queryForObject(
            """
            INSERT INTO questions (
                author_user_id, category_id, title, body, question_type, difficulty_level,
                source_type, quality_status, visibility, expected_answer_seconds, is_active, created_at, updated_at
            ) VALUES (
                NULL, ?, ?, 'Body', 'technical', 'MEDIUM',
                'catalog', 'approved', 'public', 300, true, now(), now()
            ) RETURNING id
            """.trimIndent(),
            Long::class.java,
            categoryId,
            title,
        )
    }

    private fun insertMaterial(title: String): Long = jdbcTemplate.queryForObject(
        """
        INSERT INTO learning_materials (title, material_type, content_url, source_name, created_at, updated_at)
        VALUES (?, 'article', 'https://example.com/read', 'Iterview Editorial', now(), now())
        RETURNING id
        """.trimIndent(),
        Long::class.java,
        title,
    )
}
