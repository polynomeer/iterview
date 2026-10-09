package com.example.interviewplatform.common.ratelimit

import com.example.interviewplatform.common.service.ClockService
import com.example.interviewplatform.common.service.CurrentUserProvider
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.util.AntPathMatcher
import org.springframework.web.servlet.HandlerInterceptor
import java.time.Duration

/**
 * Per-user limits on the requests that cost the most: file uploads, and requests that may call an
 * LLM or a transcription model. Each group has its own hourly budget (ADR 0090).
 */
@Component
class RequestRateLimitInterceptor(
    private val currentUserProvider: CurrentUserProvider,
    private val clockService: ClockService,
    @Value("\${app.rate-limits.upload.max-requests:20}") uploadMax: Int,
    @Value("\${app.rate-limits.upload.window-seconds:3600}") uploadWindowSeconds: Long,
    @Value("\${app.rate-limits.generation.max-requests:120}") generationMax: Int,
    @Value("\${app.rate-limits.generation.window-seconds:3600}") generationWindowSeconds: Long,
) : HandlerInterceptor {
    private val matcher = AntPathMatcher()

    private val groups = listOf(
        LimitGroup(
            name = "upload",
            limiter = FixedWindowRateLimiter(uploadMax, Duration.ofSeconds(uploadWindowSeconds)),
            routes = listOf(
                "POST /api/resumes/*/versions/upload",
                "POST /api/interview-records",
                "POST /api/me/profile-image",
            ),
        ),
        LimitGroup(
            name = "generation",
            limiter = FixedWindowRateLimiter(generationMax, Duration.ofSeconds(generationWindowSeconds)),
            routes = listOf(
                "POST /api/questions/*/answers",
                "POST /api/interview-sessions",
                "POST /api/interview-sessions/*/answers",
                "POST /api/interview-records/*/retry-transcription",
                "POST /api/resumes/*/versions",
                "POST /api/resume-versions/*/re-extract",
                "POST /api/resume-versions/*/analyses",
                "POST /api/resume-versions/*/editor/rewrite-suggestions",
                "POST /api/resume-versions/*/editor/auto-question-suggestions",
            ),
        ),
    )

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        val userId = currentUserProvider.currentUserIdOrNull() ?: return true
        val path = request.requestURI.removeSuffix("/")
        val group = groups.firstOrNull { group ->
            group.routes.any { route ->
                val (method, pattern) = route.split(' ', limit = 2)
                method.equals(request.method, ignoreCase = true) && matcher.match(pattern, path)
            }
        } ?: return true
        group.limiter.consume("user:$userId", clockService.now()) { retryAfter ->
            throw RequestRateLimitExceededException(group.name, retryAfter)
        }
        return true
    }

    private class LimitGroup(val name: String, val limiter: FixedWindowRateLimiter, val routes: List<String>)
}

class RequestRateLimitExceededException(
    val group: String,
    val retryAfterSeconds: Long,
) : RuntimeException("Too many $group requests")
