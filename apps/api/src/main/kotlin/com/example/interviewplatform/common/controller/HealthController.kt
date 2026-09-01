package com.example.interviewplatform.common.controller

import com.example.interviewplatform.common.service.ApplicationReadinessService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Health")
@RestController
@RequestMapping("/api/health")
class HealthController(
    private val applicationReadinessService: ApplicationReadinessService,
) {
    @GetMapping
    @Operation(summary = "Health check")
    fun health(): Map<String, String> = mapOf("status" to "ok")

    @GetMapping("/live")
    @Operation(summary = "Check process liveness")
    fun live(): HealthStatusResponse = HealthStatusResponse(status = "alive")

    @GetMapping("/ready")
    @Operation(summary = "Check application readiness and database connectivity")
    fun ready(): ResponseEntity<HealthStatusResponse> =
        if (applicationReadinessService.isDatabaseReady()) {
            ResponseEntity.ok(HealthStatusResponse(status = "ready", database = "up"))
        } else {
            ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(HealthStatusResponse(status = "not_ready", database = "down"))
        }
}

data class HealthStatusResponse(
    val status: String,
    val database: String? = null,
)
