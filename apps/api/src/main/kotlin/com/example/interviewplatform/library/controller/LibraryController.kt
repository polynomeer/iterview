package com.example.interviewplatform.library.controller

import com.example.interviewplatform.common.service.CurrentUserProvider
import com.example.interviewplatform.library.dto.LibraryResponseDto
import com.example.interviewplatform.library.dto.QuestionLibraryStateDto
import com.example.interviewplatform.library.dto.UpdateQuestionNoteRequest
import com.example.interviewplatform.library.service.LibraryService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Library")
@SecurityRequirement(name = "bearerAuth")
@RestController
class LibraryController(
    private val libraryService: LibraryService,
    private val currentUserProvider: CurrentUserProvider,
) {
    @GetMapping("/api/library")
    @Operation(summary = "List the current user's bookmarked questions, notes, and linked reading")
    fun getLibrary(): LibraryResponseDto = libraryService.getLibrary(currentUserProvider.currentUserId())

    @GetMapping("/api/questions/{questionId}/library-state")
    @Operation(summary = "Get whether the current user saved a question and their note on it")
    fun getQuestionState(@PathVariable questionId: Long): QuestionLibraryStateDto =
        libraryService.getQuestionState(currentUserProvider.currentUserId(), questionId)

    @PutMapping("/api/questions/{questionId}/bookmark")
    @Operation(summary = "Bookmark a question")
    fun bookmark(@PathVariable questionId: Long): QuestionLibraryStateDto =
        libraryService.bookmark(currentUserProvider.currentUserId(), questionId)

    @DeleteMapping("/api/questions/{questionId}/bookmark")
    @Operation(summary = "Remove a question bookmark")
    fun removeBookmark(@PathVariable questionId: Long): QuestionLibraryStateDto =
        libraryService.removeBookmark(currentUserProvider.currentUserId(), questionId)

    @PutMapping("/api/questions/{questionId}/note")
    @Operation(summary = "Replace the current user's note on a question; a blank body deletes it")
    fun saveNote(@PathVariable questionId: Long, @Valid @RequestBody request: UpdateQuestionNoteRequest): QuestionLibraryStateDto =
        libraryService.saveNote(currentUserProvider.currentUserId(), questionId, request.body)
}
