package com.example.interviewplatform.common.service

import org.springframework.dao.DataAccessException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class ApplicationReadinessService(
    private val jdbcTemplate: JdbcTemplate,
) {
    fun isDatabaseReady(): Boolean = try {
        jdbcTemplate.queryForObject("SELECT 1", Int::class.java) == 1
    } catch (_: DataAccessException) {
        false
    }
}
