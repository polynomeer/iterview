package com.example.interviewplatform.user.dto

import io.swagger.v3.oas.annotations.media.Schema

data class JobRoleDto(
    val id: Long,
    val name: String,
    @field:Schema(description = "Broader role this one belongs to, when roles are nested")
    val parentRoleId: Long?,
)
