package com.example.interviewplatform.common.service

import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit

@Service
class ClockService {
    // PostgreSQL keeps microseconds. Linux JVMs read nanoseconds, so an untruncated value returned before a
    // save would differ from the same value read back afterwards.
    fun now(): Instant = Instant.now().truncatedTo(ChronoUnit.MICROS)
}
