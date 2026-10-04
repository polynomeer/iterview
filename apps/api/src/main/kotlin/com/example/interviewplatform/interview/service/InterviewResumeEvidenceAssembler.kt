package com.example.interviewplatform.interview.service

import com.example.interviewplatform.resume.repository.ResumeExperienceSnapshotRepository
import com.example.interviewplatform.resume.repository.ResumeProjectSnapshotRepository
import com.example.interviewplatform.resume.repository.ResumeVersionRepository
import com.example.interviewplatform.resume.service.resumeHeaderLines
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class InterviewResumeEvidenceAssembler(
    private val resumeProjectSnapshotRepository: ResumeProjectSnapshotRepository,
    private val resumeExperienceSnapshotRepository: ResumeExperienceSnapshotRepository,
    private val resumeVersionRepository: ResumeVersionRepository,
) {
    @Transactional(readOnly = true)
    fun loadCandidates(resumeVersionId: Long, limit: Int = 8): List<InterviewResumeEvidenceCandidate> {
        val candidates = mutableListOf<InterviewResumeEvidenceCandidate>()
        val rawText = resumeVersionRepository.findById(resumeVersionId).orElse(null)?.rawText
        val pageWidth = ResumeEvidenceSentences.pageWidthOf(rawText)

        resumeProjectSnapshotRepository.findByResumeVersionIdOrderByDisplayOrderAscIdAsc(resumeVersionId)
            .take(6)
            .flatMap { project ->
                projectSnippets(project.summaryText, project.contentText, project.sourceText, pageWidth).map { snippet ->
                    InterviewResumeEvidenceCandidate(
                        section = "project",
                        label = project.title.ifBlank { null },
                        snippet = snippet,
                        facet = ResumeEvidenceSentences.facetOf(snippet),
                        sourceRecordType = "resume_project_snapshot",
                        sourceRecordId = project.id,
                    )
                }
            }
            .also(candidates::addAll)

        resumeExperienceSnapshotRepository.findByResumeVersionIdOrderByDisplayOrderAscIdAsc(resumeVersionId)
            .take(4)
            .flatMap { experience ->
                experienceSnippets(experience.summaryText, experience.impactText, experience.sourceText, pageWidth).map { snippet ->
                    InterviewResumeEvidenceCandidate(
                        section = "experience",
                        label = listOfNotNull(experience.companyName?.takeIf { it.isNotBlank() }, experience.roleName?.takeIf { it.isNotBlank() })
                            .joinToString(" - ")
                            .ifBlank { null },
                        snippet = snippet,
                        facet = ResumeEvidenceSentences.facetOf(snippet),
                        sourceRecordType = "resume_experience_snapshot",
                        sourceRecordId = experience.id,
                    )
                }
            }
            .also(candidates::addAll)

        val headerTokens = rawText.orEmpty()
            .lines()
            .map(String::trim)
            .filter(String::isNotBlank)
            .let(::resumeHeaderLines)
            .flatMap(::tokens)
            .toSet()
        return candidates
            .filter { isSubstantive(it.snippet, headerTokens) }
            .distinctBy { Triple(it.sourceRecordType, it.sourceRecordId, it.snippet) }
            .take(limit)
    }

    // A snippet must say something beyond the person's name, headline and contacts; a bare
    // "Name Backend Engineer" line is not something an interviewer can ask about.
    private fun isSubstantive(snippet: String, headerTokens: Set<String>): Boolean =
        snippet.length >= MIN_SNIPPET_LENGTH &&
            tokens(snippet).filterNot(headerTokens::contains).distinct().size >= MIN_SUBSTANTIVE_TOKENS

    private fun tokens(value: String): List<String> =
        value.lowercase().split(Regex("[^\\p{L}\\p{N}]+")).filter(String::isNotBlank)

    private fun projectSnippets(summaryText: String?, contentText: String?, sourceText: String?, pageWidth: Int?): List<String> =
        ResumeEvidenceSentences.select(
            texts = if (contentText.isNullOrBlank()) listOf(summaryText, sourceText) else listOf(contentText, summaryText),
            limit = MAX_SNIPPETS_PER_RECORD,
            maxLength = MAX_SNIPPET_LENGTH,
            pageWidth = pageWidth,
        )

    private fun experienceSnippets(summaryText: String?, impactText: String?, sourceText: String?, pageWidth: Int?): List<String> =
        ResumeEvidenceSentences.select(
            texts = listOf(summaryText, impactText, sourceText),
            limit = MAX_SNIPPETS_PER_RECORD,
            maxLength = MAX_SNIPPET_LENGTH,
            pageWidth = pageWidth,
        )

    private companion object {
        const val MAX_SNIPPET_LENGTH = 220
        const val MAX_SNIPPETS_PER_RECORD = 4
        const val MIN_SNIPPET_LENGTH = 15
        const val MIN_SUBSTANTIVE_TOKENS = 3
    }
}
