package com.example.interviewplatform.library.repository

import com.example.interviewplatform.library.entity.QuestionBookmarkEntity
import com.example.interviewplatform.library.entity.QuestionBookmarkId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant

interface QuestionBookmarkRepository : JpaRepository<QuestionBookmarkEntity, QuestionBookmarkId> {
    fun findByIdUserIdOrderByCreatedAtDesc(userId: Long): List<QuestionBookmarkEntity>

    /** Idempotent even when two requests arrive together. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(
        value = """
            INSERT INTO question_bookmarks (user_id, question_id, created_at)
            VALUES (:userId, :questionId, :now)
            ON CONFLICT (user_id, question_id) DO NOTHING
        """,
        nativeQuery = true,
    )
    fun insertIfAbsent(@Param("userId") userId: Long, @Param("questionId") questionId: Long, @Param("now") now: Instant)

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "DELETE FROM question_bookmarks WHERE user_id = :userId AND question_id = :questionId", nativeQuery = true)
    fun deleteBookmark(@Param("userId") userId: Long, @Param("questionId") questionId: Long)
}
