package com.example.interviewplatform.library.entity

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant

@Embeddable
data class QuestionBookmarkId(
    @Column(name = "user_id", nullable = false)
    val userId: Long = 0,
    @Column(name = "question_id", nullable = false)
    val questionId: Long = 0,
) : Serializable

@Entity
@Table(name = "question_bookmarks")
class QuestionBookmarkEntity(
    @EmbeddedId
    val id: QuestionBookmarkId,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant,
)
