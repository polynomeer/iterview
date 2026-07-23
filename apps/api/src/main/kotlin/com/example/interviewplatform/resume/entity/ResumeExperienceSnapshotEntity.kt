package com.example.interviewplatform.resume.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDate

@Entity
@Table(name = "resume_experience_snapshots")
class ResumeExperienceSnapshotEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(name = "resume_version_id", nullable = false)
    val resumeVersionId: Long,
    @Column(name = "company_name")
    val companyName: String? = null,
    @Column(name = "role_name")
    val roleName: String? = null,
    @Column(name = "employment_type")
    val employmentType: String? = null,
    @Column(name = "started_on")
    val startedOn: LocalDate? = null,
    @Column(name = "ended_on")
    val endedOn: LocalDate? = null,
    @Column(name = "is_current", nullable = false)
    val isCurrent: Boolean = false,
    @Column(name = "project_name")
    val projectName: String? = null,
    @Column(name = "summary_text", nullable = false)
    val summaryText: String,
    @Column(name = "impact_text")
    val impactText: String? = null,
    @Column(name = "source_text", nullable = false)
    val sourceText: String,
    @Column(name = "risk_level", nullable = false)
    val riskLevel: String,
    @Column(name = "display_order", nullable = false)
    val displayOrder: Int,
    @Column(name = "is_confirmed", nullable = false)
    val isConfirmed: Boolean = false,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant,
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant,
)
