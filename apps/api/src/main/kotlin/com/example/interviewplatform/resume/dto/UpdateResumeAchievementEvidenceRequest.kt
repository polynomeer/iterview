package com.example.interviewplatform.resume.dto

import jakarta.validation.constraints.Size

/** Replaces all four evidence fields of a claim. Blank or missing fields are stored as unanswered. */
data class UpdateResumeAchievementEvidenceRequest(
    @field:Size(max = 2000)
    val situationText: String? = null,
    @field:Size(max = 2000)
    val roleText: String? = null,
    @field:Size(max = 2000)
    val measurementText: String? = null,
    @field:Size(max = 2000)
    val resultText: String? = null,
)
