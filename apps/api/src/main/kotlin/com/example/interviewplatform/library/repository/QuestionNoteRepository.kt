package com.example.interviewplatform.library.repository

import com.example.interviewplatform.library.entity.QuestionNoteEntity
import org.springframework.data.jpa.repository.JpaRepository

interface QuestionNoteRepository : JpaRepository<QuestionNoteEntity, Long> {
    fun findByUserIdAndQuestionId(userId: Long, questionId: Long): QuestionNoteEntity?

    fun findByUserIdOrderByUpdatedAtDesc(userId: Long): List<QuestionNoteEntity>
}
