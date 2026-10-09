package com.example.interviewplatform.common.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import java.time.LocalDate
import java.time.ZoneId

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

    @AfterEach
    fun clearRequest() {
        RequestContextHolder.resetRequestAttributes()
    }

    @Test
    fun `today follows the time zone the browser sends`() {
        // UTC+14 and UTC-11 are 25 hours apart, so their dates always differ.
        val clock = ClockService("Asia/Seoul")

        withTimeZoneHeader("Pacific/Kiritimati")
        assertEquals(LocalDate.now(ZoneId.of("Pacific/Kiritimati")), clock.today())

        withTimeZoneHeader("Pacific/Pago_Pago")
        assertEquals(LocalDate.now(ZoneId.of("Pacific/Pago_Pago")), clock.today())
    }

    @Test
    fun `an unknown zone or a bare offset falls back to the configured zone`() {
        val clock = ClockService("Asia/Seoul")
        listOf("Mars/Olympus", "+09:00", "UTC", "").forEach { header ->
            withTimeZoneHeader(header)
            assertEquals(ZoneId.of("Asia/Seoul"), clock.currentZone(), header)
        }
    }

    private fun withTimeZoneHeader(value: String) {
        val request = MockHttpServletRequest().apply { addHeader(ClockService.HEADER_TIME_ZONE, value) }
        RequestContextHolder.setRequestAttributes(ServletRequestAttributes(request))
    }
}
