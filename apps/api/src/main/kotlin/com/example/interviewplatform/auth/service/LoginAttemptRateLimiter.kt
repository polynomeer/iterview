package com.example.interviewplatform.auth.service

import com.example.interviewplatform.common.service.ClockService
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Service
class LoginAttemptRateLimiter(
    private val clockService: ClockService,
    @Value("\${app.rate-limits.login.max-attempts:5}")
    private val maxAttempts: Int,
    @Value("\${app.rate-limits.login.window-seconds:900}")
    private val windowSeconds: Long,
) {
    private val windows = ConcurrentHashMap<String, LoginAttemptWindow>()

    fun consumeAttempt(email: String) {
        if (maxAttempts <= 0 || windowSeconds <= 0) {
            return
        }

        val key = email.trim().lowercase()
        val now = clockService.now()
        windows.compute(key) { _, existing ->
            if (existing == null || !now.isBefore(existing.startedAt.plusSeconds(windowSeconds))) {
                return@compute LoginAttemptWindow(startedAt = now, attempts = 1)
            }
            if (existing.attempts >= maxAttempts) {
                throw LoginAttemptRateLimitExceededException(retryAfterSeconds(existing.startedAt, now))
            }
            existing.copy(attempts = existing.attempts + 1)
        }
    }

    fun clear(email: String) {
        windows.remove(email.trim().lowercase())
    }

    private fun retryAfterSeconds(startedAt: Instant, now: Instant): Long =
        Duration.between(now, startedAt.plusSeconds(windowSeconds)).seconds.coerceAtLeast(1)

    private data class LoginAttemptWindow(
        val startedAt: Instant,
        val attempts: Int,
    )
}

class LoginAttemptRateLimitExceededException(
    val retryAfterSeconds: Long,
) : RuntimeException("Too many login attempts")
