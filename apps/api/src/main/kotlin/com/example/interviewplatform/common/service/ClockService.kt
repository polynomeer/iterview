package com.example.interviewplatform.common.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import java.time.DateTimeException
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit

@Service
class ClockService(
    /** The calendar the product's day follows when the client does not send one (ADR 0085). */
    @Value("\${app.time-zone:Asia/Seoul}") timeZone: String = "Asia/Seoul",
) {
    val zone: ZoneId = ZoneId.of(timeZone)

    // PostgreSQL keeps microseconds. Linux JVMs read nanoseconds, so an untruncated value returned before a
    // save would differ from the same value read back afterwards.
    fun now(): Instant = Instant.now().truncatedTo(ChronoUnit.MICROS)

    /** "Today" for the person making the request: their browser's time zone, else [zone]. */
    fun today(): LocalDate = LocalDate.ofInstant(now(), currentZone())

    fun currentZone(): ZoneId = requestZone() ?: zone

    // The web client sends the browser's IANA zone, such as "Europe/Berlin". Offsets and unknown
    // names are ignored rather than rejected, so a bad header never breaks a request.
    private fun requestZone(): ZoneId? {
        val request = (RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes)?.request ?: return null
        val header = request.getHeader(HEADER_TIME_ZONE)?.trim()?.takeIf { it.isNotEmpty() && it.length <= 64 } ?: return null
        return try {
            ZoneId.of(header).takeUnless { it is ZoneOffset || !header.contains('/') }
        } catch (_: DateTimeException) {
            null
        }
    }

    companion object {
        const val HEADER_TIME_ZONE = "X-Time-Zone"
    }
}
