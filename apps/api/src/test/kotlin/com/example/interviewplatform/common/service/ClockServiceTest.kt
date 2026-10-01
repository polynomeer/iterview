package com.example.interviewplatform.common.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ClockServiceTest {
    @Test
    fun `now matches the microsecond precision PostgreSQL stores`() {
        repeat(100) {
            assertEquals(0, ClockService().now().nano % 1_000)
        }
    }
}
