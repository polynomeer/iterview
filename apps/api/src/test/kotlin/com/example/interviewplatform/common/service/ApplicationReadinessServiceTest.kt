package com.example.interviewplatform.common.service

import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.springframework.dao.DataAccessResourceFailureException
import org.springframework.jdbc.core.JdbcTemplate
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ApplicationReadinessServiceTest {
    private val jdbcTemplate = mock(JdbcTemplate::class.java)
    private val service = ApplicationReadinessService(jdbcTemplate)

    @Test
    fun `reports ready when the database query succeeds`() {
        `when`(jdbcTemplate.queryForObject("SELECT 1", Int::class.java)).thenReturn(1)

        assertTrue(service.isDatabaseReady())
    }

    @Test
    fun `reports not ready when the database query fails`() {
        `when`(jdbcTemplate.queryForObject("SELECT 1", Int::class.java))
            .thenThrow(DataAccessResourceFailureException("database unavailable"))

        assertFalse(service.isDatabaseReady())
    }
}
