package com.example.interviewplatform.question.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "learning_materials")
class LearningMaterialEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false)
    val title: String,
    @Column(name = "material_type", nullable = false)
    val materialType: String,
    @Column(name = "content_text")
    val contentText: String? = null,
    @Column(name = "content_url")
    val contentUrl: String? = null,
    @Column(name = "source_name")
    val sourceName: String? = null,
    @Column(name = "content_locale")
    val contentLocale: String? = null,
    @Column(name = "description")
    val description: String? = null,
    @Column(name = "difficulty_level")
    val difficultyLevel: String? = null,
    @Column(name = "estimated_minutes")
    val estimatedMinutes: Int? = null,
    @Column(name = "is_official", nullable = false)
    val isOfficial: Boolean = false,
    @Column(name = "display_order_hint")
    val displayOrderHint: Int? = null,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant,
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant,
)
