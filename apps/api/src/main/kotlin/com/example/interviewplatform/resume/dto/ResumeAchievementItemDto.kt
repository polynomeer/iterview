package com.example.interviewplatform.resume.dto

import java.time.Instant

data class ResumeAchievementItemDto(
    val id: Long,
    val resumeExperienceSnapshotId: Long?,
    val resumeProjectSnapshotId: Long?,
    val title: String,
    val metricText: String?,
    val impactSummary: String,
    val sourceText: String?,
    val severityHint: String?,
    val displayOrder: Int,
    val evidence: ResumeAchievementEvidenceDto,
)

/** What the user wrote to back a claim: 상황 · 내 역할 · 측정 방법 · 결과 수치. Null fields are unanswered. */
data class ResumeAchievementEvidenceDto(
    val situationText: String?,
    val roleText: String?,
    val measurementText: String?,
    val resultText: String?,
    val updatedAt: Instant?,
)
