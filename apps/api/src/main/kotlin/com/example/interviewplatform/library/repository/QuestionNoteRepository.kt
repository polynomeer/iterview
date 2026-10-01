package com.example.interviewplatform.library.repository

import com.example.interviewplatform.library.entity.QuestionNoteEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant

interface QuestionNoteRepository : JpaRepository<QuestionNoteEntity, Long> {
    fun findByUserIdAndQuestionId(userId: Long, questionId: Long): QuestionNoteEntity?

    fun findByUserIdOrderByUpdatedAtDesc(userId: Long): List<QuestionNoteEntity>

    /** Insert or replace in one statement, so two saves at once cannot collide on the unique key. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(
        value = """
            INSERT INTO question_notes (user_id, question_id, body, created_at, updated_at)
            VALUES (:userId, :questionId, :body, :now, :now)
            ON CONFLICT (user_id, question_id) DO UPDATE SET body = EXCLUDED.body, updated_at = EXCLUDED.updated_at
        """,
        nativeQuery = true,
    )
    fun upsert(@Param("userId") userId: Long, @Param("questionId") questionId: Long, @Param("body") body: String, @Param("now") now: Instant)

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "DELETE FROM question_notes WHERE user_id = :userId AND question_id = :questionId", nativeQuery = true)
    fun deleteNote(@Param("userId") userId: Long, @Param("questionId") questionId: Long)
}
