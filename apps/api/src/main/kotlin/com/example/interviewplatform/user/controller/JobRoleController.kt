package com.example.interviewplatform.user.controller

import com.example.interviewplatform.user.dto.JobRoleDto
import com.example.interviewplatform.user.repository.JobRoleRepository
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Sort
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Profile")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/job-roles")
class JobRoleController(
    private val jobRoleRepository: JobRoleRepository,
) {
    @GetMapping
    @Operation(summary = "List job roles a profile can pick (the jobRoleId values PATCH /api/me/profile accepts)")
    fun listJobRoles(): List<JobRoleDto> =
        jobRoleRepository.findAll(Sort.by("name")).map { JobRoleDto(id = it.id, name = it.name, parentRoleId = it.parentRoleId) }
}
