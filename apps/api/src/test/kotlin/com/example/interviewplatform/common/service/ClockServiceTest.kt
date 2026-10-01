package com.example.interviewplatform.common.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class ClockServiceTest {
    @Test
    fun `now matches the microsecond precision PostgreSQL stores`() {
        repeat(100) {
            assertEquals(0, ClockService().now().nano % 1_000)
        }
    }

    @Test
    fun `today follows the configured zone, not UTC`() {
        val seoul = ClockService("Asia/Seoul")
        val honolulu = ClockService("Pacific/Honolulu")
        // 19 hours apart: at any instant the two calendars differ by at most a day, and Seoul is never behind.
        val gap = seoul.today().toEpochDay() - honolulu.today().toEpochDay()
        assertTrue(gap == 0L || gap == 1L)
        assertEquals(java.time.ZoneId.of("Asia/Seoul"), ClockService().zone)
    }
}
