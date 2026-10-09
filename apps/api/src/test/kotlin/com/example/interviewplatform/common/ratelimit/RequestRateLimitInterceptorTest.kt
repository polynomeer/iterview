package com.example.interviewplatform.common.ratelimit

import com.example.interviewplatform.auth.security.AuthenticatedUser
import com.example.interviewplatform.common.service.ClockService
import com.example.interviewplatform.common.service.CurrentUserProvider
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import java.time.Duration
import java.time.Instant

class RequestRateLimitInterceptorTest {
    private val interceptor = RequestRateLimitInterceptor(
        currentUserProvider = CurrentUserProvider(),
        clockService = ClockService(),
        uploadMax = 2,
        uploadWindowSeconds = 3600,
        generationMax = 3,
        generationWindowSeconds = 3600,
    )

    @AfterEach
    fun clearUser() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `uploads past the hourly budget are refused per user`() {
        signIn(1)
        repeat(2) { assertTrue(call("POST", "/api/resumes/7/versions/upload")) }
        val refused = assertThrows<RequestRateLimitExceededException> { call("POST", "/api/resumes/7/versions/upload") }
        assertEquals("upload", refused.group)
        assertTrue(refused.retryAfterSeconds in 1..3600)

        signIn(2)
        assertTrue(call("POST", "/api/me/profile-image"))
    }

    @Test
    fun `generation routes share one budget and other routes are not counted`() {
        signIn(3)
        assertTrue(call("POST", "/api/questions/1/answers"))
        assertTrue(call("POST", "/api/interview-sessions"))
        assertTrue(call("POST", "/api/interview-sessions/9/answers"))
        repeat(10) {
            assertTrue(call("POST", "/api/interview-sessions/9/skip-question"))
            assertTrue(call("GET", "/api/questions/1/answers"))
        }
        assertThrows<RequestRateLimitExceededException> { call("POST", "/api/resume-versions/4/re-extract") }
    }

    @Test
    fun `anonymous requests are left to authentication`() {
        repeat(5) { assertTrue(call("POST", "/api/resumes/7/versions/upload")) }
    }

    @Test
    fun `a window opens again once it has passed`() {
        val limiter = FixedWindowRateLimiter(1, Duration.ofMinutes(10))
        val start = Instant.parse("2026-10-09T00:00:00Z")
        limiter.consume("k", start) { error("first attempt is allowed") }
        assertThrows<IllegalStateException> { limiter.consume("k", start.plusSeconds(60)) { error("refused $it") } }
        limiter.consume("k", start.plus(Duration.ofMinutes(10))) { error("a new window is allowed") }
    }

    private fun signIn(userId: Long) {
        val user = AuthenticatedUser(id = userId, email = "user$userId@example.com")
        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(user, null, emptyList())
    }

    private fun call(method: String, path: String): Boolean =
        interceptor.preHandle(MockHttpServletRequest(method, path), MockHttpServletResponse(), Any())
}
