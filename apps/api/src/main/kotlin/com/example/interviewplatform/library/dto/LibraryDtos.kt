package com.example.interviewplatform.library.dto

import jakarta.validation.constraints.Size
import java.time.Instant

/** Whether the current user saved a question, and their note on it. */
data class QuestionLibraryStateDto(
    val questionId: Long,
    val bookmarked: Boolean,
    val bookmarkedAt: Instant?,
    val note: QuestionNoteDto?,
)

data class QuestionNoteDto(
    val body: String,
    val updatedAt: Instant,
)

/** Replaces the note; a blank body deletes it. */
data class UpdateQuestionNoteRequest(
    @field:Size(max = 5000)
    val body: String = "",
)

data class LibraryQuestionDto(
    val questionId: Long,
    val title: String,
    val categoryName: String?,
    val difficultyLevel: String,
)

data class LibraryBookmarkDto(
    val question: LibraryQuestionDto,
    val bookmarkedAt: Instant,
    val hasNote: Boolean,
)

data class LibraryNoteDto(
    val question: LibraryQuestionDto,
    val body: String,
    val updatedAt: Instant,
    val bookmarked: Boolean,
)

/** Reading linked to a saved or noted question; one row per material, under its most relevant question. */
data class LibraryMaterialDto(
    val materialId: Long,
    val title: String,
    val materialType: String,
    val sourceName: String?,
    val contentUrl: String?,
    val estimatedMinutes: Int?,
    val question: LibraryQuestionDto,
)

data class LibraryResponseDto(
    val bookmarks: List<LibraryBookmarkDto>,
    val notes: List<LibraryNoteDto>,
    val materials: List<LibraryMaterialDto>,
)
