package com.example.interviewplatform.question.repository

import com.example.interviewplatform.question.entity.QuestionEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface QuestionRepository : JpaRepository<QuestionEntity, Long> {
    /** Active catalog questions anyone may see. Interview-generated questions are private. */
    @Query("select q from QuestionEntity q where q.isActive = true and lower(q.visibility) = 'public'")
    fun findPublicActive(): List<QuestionEntity>

    /** Active questions [userId] may see: the public catalog plus their own private questions. */
    @Query(
        "select q from QuestionEntity q where q.isActive = true " +
            "and (lower(q.visibility) = 'public' or q.authorUserId = :userId)",
    )
    fun findVisibleActive(@Param("userId") userId: Long): List<QuestionEntity>

    fun findByIdAndIsActiveTrue(id: Long): QuestionEntity?
}
