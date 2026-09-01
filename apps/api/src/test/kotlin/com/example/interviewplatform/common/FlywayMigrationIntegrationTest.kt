package com.example.interviewplatform.common

import com.example.interviewplatform.support.ApiIntegrationTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate

@ApiIntegrationTest
class FlywayMigrationIntegrationTest {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Test
    fun `creates all core tables`() {
        val tableCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name IN ('users', 'questions', 'answer_attempts', 'review_queue', 'daily_cards')
            """.trimIndent(),
            Int::class.java,
        )

        assertEquals(5, tableCount)
    }
}
