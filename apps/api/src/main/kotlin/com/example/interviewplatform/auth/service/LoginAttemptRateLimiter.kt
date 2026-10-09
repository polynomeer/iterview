package com.example.interviewplatform.auth.service

import com.example.interviewplatform.common.ratelimit.FixedWindowRateLimiter
import com.example.interviewplatform.common.service.ClockService
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class LoginAttemptRateLimiter(
    private val clockService: ClockService,
    @Value("\${app.rate-limits.login.max-attempts:5}")
    maxAttempts: Int,
    @Value("\${app.rate-limits.login.window-seconds:900}")
    windowSeconds: Long,
) {
    private val limiter = FixedWindowRateLimiter(maxAttempts, Duration.ofSeconds(windowSeconds))

    fun consumeAttempt(email: String) {
        limiter.consume(key(email), clockService.now()) { retryAfter ->
            throw LoginAttemptRateLimitExceededException(retryAfter)
        }
    }

    fun clear(email: String) {
        limiter.clear(key(email))
    }

    private fun key(email: String) = email.trim().lowercase()
}

class LoginAttemptRateLimitExceededException(
    val retryAfterSeconds: Long,
) : RuntimeException("Too many login attempts")
