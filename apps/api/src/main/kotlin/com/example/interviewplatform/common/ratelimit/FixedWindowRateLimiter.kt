package com.example.interviewplatform.common.ratelimit

import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

/**
 * Counts attempts per key in fixed windows, in memory. One instance serves one limit; a
 * restart forgets every window, which is acceptable for abuse protection on a single node.
 */
class FixedWindowRateLimiter(
    private val maxAttempts: Int,
    private val window: Duration,
) {
    private val windows = ConcurrentHashMap<String, Window>()

    val enabled: Boolean get() = maxAttempts > 0 && !window.isZero && !window.isNegative

    /** Records an attempt for [key] at [now], or throws when the window is already full. */
    fun consume(key: String, now: Instant, onExceeded: (retryAfterSeconds: Long) -> Nothing) {
        if (!enabled) {
            return
        }
        windows.compute(key) { _, existing ->
            if (existing == null || !now.isBefore(existing.startedAt.plus(window))) {
                return@compute Window(startedAt = now, attempts = 1)
            }
            if (existing.attempts >= maxAttempts) {
                onExceeded(Duration.between(now, existing.startedAt.plus(window)).seconds.coerceAtLeast(1))
            }
            existing.copy(attempts = existing.attempts + 1)
        }
    }

    fun clear(key: String) {
        windows.remove(key)
    }

    private data class Window(val startedAt: Instant, val attempts: Int)
}
