package com.example.interviewplatform.library.service

import com.example.interviewplatform.common.service.ClockService
import com.example.interviewplatform.library.dto.LibraryBookmarkDto
import com.example.interviewplatform.library.dto.LibraryMaterialDto
import com.example.interviewplatform.library.dto.LibraryNoteDto
import com.example.interviewplatform.library.dto.LibraryQuestionDto
import com.example.interviewplatform.library.dto.LibraryResponseDto
import com.example.interviewplatform.library.dto.QuestionLibraryStateDto
import com.example.interviewplatform.library.dto.QuestionNoteDto
import com.example.interviewplatform.library.entity.QuestionBookmarkId
import com.example.interviewplatform.library.repository.QuestionBookmarkRepository
import com.example.interviewplatform.library.repository.QuestionNoteRepository
import com.example.interviewplatform.question.repository.CategoryRepository
import com.example.interviewplatform.question.repository.LearningMaterialRepository
import com.example.interviewplatform.question.repository.QuestionLearningMaterialRepository
import com.example.interviewplatform.question.repository.QuestionRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

/** 보관함 (ADR 0083): bookmarks and notes on questions, and the reading linked to them. */
@Service
class LibraryService(
    private val bookmarkRepository: QuestionBookmarkRepository,
    private val noteRepository: QuestionNoteRepository,
    private val questionRepository: QuestionRepository,
    private val categoryRepository: CategoryRepository,
    private val questionLearningMaterialRepository: QuestionLearningMaterialRepository,
    private val learningMaterialRepository: LearningMaterialRepository,
    private val clockService: ClockService,
) {
    @Transactional(readOnly = true)
    fun getQuestionState(userId: Long, questionId: Long): QuestionLibraryStateDto {
        requireQuestion(questionId)
        return state(userId, questionId)
    }

    @Transactional
    fun bookmark(userId: Long, questionId: Long): QuestionLibraryStateDto {
        requireQuestion(questionId)
        bookmarkRepository.insertIfAbsent(userId, questionId, clockService.now())
        return state(userId, questionId)
    }

    @Transactional
    fun removeBookmark(userId: Long, questionId: Long): QuestionLibraryStateDto {
        requireQuestion(questionId)
        bookmarkRepository.deleteBookmark(userId, questionId)
        return state(userId, questionId)
    }

    @Transactional
    fun saveNote(userId: Long, questionId: Long, body: String): QuestionLibraryStateDto {
        requireQuestion(questionId)
        val text = body.trim()
        if (text.isEmpty()) {
            noteRepository.deleteNote(userId, questionId)
        } else {
            noteRepository.upsert(userId, questionId, text, clockService.now())
        }
        return state(userId, questionId)
    }

    @Transactional(readOnly = true)
    fun getLibrary(userId: Long): LibraryResponseDto {
        val bookmarks = bookmarkRepository.findByIdUserIdOrderByCreatedAtDesc(userId)
        val notes = noteRepository.findByUserIdOrderByUpdatedAtDesc(userId)
        val questionIds = (bookmarks.map { it.id.questionId } + notes.map { it.questionId }).distinct()
        if (questionIds.isEmpty()) {
            return LibraryResponseDto(bookmarks = emptyList(), notes = emptyList(), materials = emptyList())
        }

        val questions = questionRepository.findAllById(questionIds).associateBy { it.id }
        val categories = categoryRepository.findAllById(questions.values.map { it.categoryId }.distinct()).associateBy { it.id }
        val summaries = questions.mapValues { (_, question) ->
            LibraryQuestionDto(
                questionId = question.id,
                title = question.title,
                categoryName = categories[question.categoryId]?.name,
                difficultyLevel = question.difficultyLevel,
            )
        }
        val bookmarkedIds = bookmarks.map { it.id.questionId }.toSet()
        val notedIds = notes.map { it.questionId }.toSet()

        // Each material once, under the saved question it is most relevant to; saved questions keep their order.
        val order = questionIds.withIndex().associate { (index, id) -> id to index }
        val links = questionLearningMaterialRepository.findByIdQuestionIdIn(questionIds)
            .sortedWith(compareBy({ order[it.id.questionId] }, { -it.relevanceScore.toDouble() }))
            .distinctBy { it.id.learningMaterialId }
        val materials = learningMaterialRepository.findAllById(links.map { it.id.learningMaterialId }).associateBy { it.id }

        return LibraryResponseDto(
            bookmarks = bookmarks.mapNotNull { bookmark ->
                summaries[bookmark.id.questionId]?.let { LibraryBookmarkDto(it, bookmark.createdAt, bookmark.id.questionId in notedIds) }
            },
            notes = notes.mapNotNull { note ->
                summaries[note.questionId]?.let { LibraryNoteDto(it, note.body, note.updatedAt, note.questionId in bookmarkedIds) }
            },
            materials = links.mapNotNull { link ->
                val material = materials[link.id.learningMaterialId] ?: return@mapNotNull null
                val question = summaries[link.id.questionId] ?: return@mapNotNull null
                LibraryMaterialDto(
                    materialId = material.id,
                    title = material.title,
                    materialType = material.materialType,
                    sourceName = material.sourceName,
                    contentUrl = material.contentUrl,
                    estimatedMinutes = material.estimatedMinutes,
                    question = question,
                )
            },
        )
    }

    private fun state(userId: Long, questionId: Long): QuestionLibraryStateDto {
        val bookmark = bookmarkRepository.findById(QuestionBookmarkId(userId, questionId)).orElse(null)
        val note = noteRepository.findByUserIdAndQuestionId(userId, questionId)
        return QuestionLibraryStateDto(
            questionId = questionId,
            bookmarked = bookmark != null,
            bookmarkedAt = bookmark?.createdAt,
            note = note?.let { QuestionNoteDto(body = it.body, updatedAt = it.updatedAt) },
        )
    }

    private fun requireQuestion(questionId: Long) {
        questionRepository.findByIdAndIsActiveTrue(questionId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found: $questionId")
    }
}
