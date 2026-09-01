package com.example.interviewplatform.auth.controller

import com.example.interviewplatform.support.ApiIntegrationTest
import com.example.interviewplatform.auth.service.TokenService
import com.example.interviewplatform.support.TestDatabaseCleaner
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.http.HttpHeaders
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@ApiIntegrationTest
class AuthApiIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var tokenService: TokenService

    @BeforeEach
    fun setUp() {
        TestDatabaseCleaner.reset(jdbcTemplate)
    }

    @Test
    fun `authenticated access succeeds with login token`() {
        mockMvc.perform(
            post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        mapOf(
                            "email" to "auth-signup@example.com",
                            "password" to "password123",
                        ),
                    ),
                ),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accessToken").isString)
            .andExpect(jsonPath("$.user.email").value("auth-signup@example.com"))

        val loginResult = mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        mapOf(
                            "email" to "auth-signup@example.com",
                            "password" to "password123",
                        ),
                    ),
                ),
        )
            .andExpect(status().isOk)
            .andReturn()

        val token = objectMapper.readTree(loginResult.response.contentAsString).get("accessToken").asText()

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer $token"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value("auth-signup@example.com"))
    }

    @Test
    fun `unauthenticated access is rejected for protected endpoint`() {
        mockMvc.perform(get("/api/me"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `invalid bearer token is rejected for protected endpoints`() {
        mockMvc.perform(get("/api/me").header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `auth rules protect core mvp endpoints`() {
        mockMvc.perform(get("/api/resumes"))
            .andExpect(status().isUnauthorized)
        mockMvc.perform(get("/api/home"))
            .andExpect(status().isUnauthorized)
        mockMvc.perform(get("/api/review-queue"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `public question endpoints are accessible without auth`() {
        mockMvc.perform(get("/api/questions"))
            .andExpect(status().isOk)
    }

    @Test
    fun `current user resolution uses bearer token identity`() {
        jdbcTemplate.update(
            """
            INSERT INTO users (id, email, password_hash, provider, provider_user_id, status, created_at, updated_at)
            VALUES (101, 'auth-a@example.com', NULL, 'local', NULL, 'ACTIVE', now(), now()),
                   (102, 'auth-b@example.com', NULL, 'local', NULL, 'ACTIVE', now(), now())
            """.trimIndent(),
        )

        val tokenA = tokenService.issueToken(101, "auth-a@example.com")
        val tokenB = tokenService.issueToken(102, "auth-b@example.com")

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer $tokenA"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(101))
            .andExpect(jsonPath("$.email").value("auth-a@example.com"))

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer $tokenB"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(102))
            .andExpect(jsonPath("$.email").value("auth-b@example.com"))
    }

    @Test
    fun `repeated failed login attempts are rate limited per email`() {
        val email = "rate-limit@example.com"
        mockMvc.perform(
            post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mapOf("email" to email, "password" to "password123"))),
        ).andExpect(status().isOk)

        repeat(5) {
            mockMvc.perform(
                post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mapOf("email" to email, "password" to "not-the-password"))),
            ).andExpect(status().isUnauthorized)
        }

        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mapOf("email" to email, "password" to "not-the-password"))),
        )
            .andExpect(status().isTooManyRequests)
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().exists(HttpHeaders.RETRY_AFTER))
            .andExpect(jsonPath("$.error.code").value("LOGIN_RATE_LIMITED"))
            .andExpect(jsonPath("$.error.message").value("로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요."))
    }

    @Test
    fun `successful login clears earlier failed login attempts`() {
        val email = "rate-limit-reset@example.com"
        mockMvc.perform(
            post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mapOf("email" to email, "password" to "password123"))),
        ).andExpect(status().isOk)

        repeat(4) {
            mockMvc.perform(
                post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mapOf("email" to email, "password" to "not-the-password"))),
            ).andExpect(status().isUnauthorized)
        }

        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mapOf("email" to email, "password" to "password123"))),
        ).andExpect(status().isOk)

        repeat(5) {
            mockMvc.perform(
                post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mapOf("email" to email, "password" to "not-the-password"))),
            ).andExpect(status().isUnauthorized)
        }
    }
}
