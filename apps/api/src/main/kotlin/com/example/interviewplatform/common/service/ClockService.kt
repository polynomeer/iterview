package com.example.interviewplatform.common.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit

@Service
class ClockService(
    /** The calendar the product's day follows: what "today" means for daily cards (ADR 0085). */
    @Value("\${app.time-zone:Asia/Seoul}") timeZone: String = "Asia/Seoul",
) {
    val zone: ZoneId = ZoneId.of(timeZone)

    // PostgreSQL keeps microseconds. Linux JVMs read nanoseconds, so an untruncated value returned before a
    // save would differ from the same value read back afterwards.
    fun now(): Instant = Instant.now().truncatedTo(ChronoUnit.MICROS)

    fun today(): LocalDate = LocalDate.ofInstant(now(), zone)
}
