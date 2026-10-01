package com.example.interviewplatform.library.repository

import com.example.interviewplatform.library.entity.QuestionBookmarkEntity
import com.example.interviewplatform.library.entity.QuestionBookmarkId
import org.springframework.data.jpa.repository.JpaRepository

interface QuestionBookmarkRepository : JpaRepository<QuestionBookmarkEntity, QuestionBookmarkId> {
    fun findByIdUserIdOrderByCreatedAtDesc(userId: Long): List<QuestionBookmarkEntity>
}
