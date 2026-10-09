package com.example.interviewplatform.support

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.testcontainers.junit.jupiter.Testcontainers

@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(
    properties = [
        // Keep host-local transcription credentials and models out of deterministic integration tests.
        "app.interview.transcription.provider=whisper_cpp",
        "app.interview.transcription.whisper.model-path=",
        // Every test reuses user 1 in one shared context, so the hourly request budgets would run out
        // partway through the suite. RequestRateLimitApiIntegrationTest turns them back on.
        "app.rate-limits.upload.max-requests=0",
        "app.rate-limits.generation.max-requests=0",
    ],
)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
annotation class ApiIntegrationTest
