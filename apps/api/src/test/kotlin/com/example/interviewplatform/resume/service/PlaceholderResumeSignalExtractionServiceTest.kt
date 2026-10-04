package com.example.interviewplatform.resume.service

import com.example.interviewplatform.resume.entity.ResumeVersionEntity
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Instant
import java.time.LocalDate

class PlaceholderResumeSignalExtractionServiceTest {
    private val service = PlaceholderResumeSignalExtractionService(ObjectMapper())

    @Test
    fun `english section titles and dash ranges are read as career and projects`() {
        val signals = service.extract(version(SECTIONED_RESUME, summaryText = "Kim Dev Backend Engineer Small steps win."))

        assertEquals(listOf("Acme Music", "Beta Fish"), signals.experiences.map { it.companyName })
        val acme = signals.experiences.first()
        assertEquals("Backend developer", acme.roleName)
        assertEquals(LocalDate.of(2021, 12, 1), acme.startedOn)
        assertEquals(LocalDate.of(2025, 2, 1), acme.endedOn)
        assertTrue(signals.experiences.none { it.sourceText.contains("Kim Dev") })

        assertEquals(listOf("Contents platform rebuild", "Batch memory tuning"), signals.projects.map { it.title })
        val rebuild = signals.projects.first()
        assertEquals("Acme Music", rebuild.organizationName)
        assertEquals(acme.displayOrder, rebuild.experienceDisplayOrder)
        assertFalse(rebuild.contentText.orEmpty().lines().contains("Acme Music"))

        assertTrue(signals.contacts.any { it.contactType == "email" && it.valueText == "kim@example.com" })
        assertTrue(signals.achievements.any { it.sourceText == "API latency 1.5초 → 300ms after the 앨범·트랙 split" })
    }

    @Test
    fun `fallback experience never uses the name and contact header`() {
        val signals = service.extract(
            version(
                """
                Kim Dev Backend Engineer
                Small steps win every time.
                Tel 010-1234-5678 Mail kim@example.com
                Rebuilt the settlement batch so monthly payouts finish within one hour.
                """.trimIndent(),
                summaryText = "Kim Dev Backend Engineer Small steps win every time.",
            ),
        )

        assertEquals(1, signals.experiences.size)
        assertTrue(signals.experiences.single().sourceText.startsWith("Rebuilt the settlement batch"))
    }

    private fun version(rawText: String, summaryText: String?) = ResumeVersionEntity(
        resumeId = 1,
        versionNo = 1,
        rawText = rawText,
        summaryText = summaryText,
        parsingStatus = "completed",
        uploadedAt = Instant.EPOCH,
        createdAt = Instant.EPOCH,
    )

    private companion object {
        val SECTIONED_RESUME = """
            Kim Dev Backend Engineer
            Small steps win.
            Tel 010-1234-5678 Mail kim@example.com GitHub github.com/kimdev
            SUMMARY
            I design transaction-safe backends for settlement domains.
            CAREER
            Acme Music — Backend developer · streaming company 2021.12 – 2025.2
            Contents platform rebuild 2024.1 – 2025.2 performance redesign
            Finished the rebuild (2024.1–2024.11) and kept running it until leaving.
            Side project — Ledger API (2026.7 – 진행 중): verified balances under load
            Beta Fish — App developer 2021.6 – 2021.9
            Built partner store payments.
            EDUCATION
            2012.3 – 2020.2 Computer science degree
            경력기술서
            Projects are listed newest first.
            Acme Music (Acme Music, 2021.12 – 2025.2) runs a streaming service.
            Contents platform rebuild 2024.1 – 2025.2
            Acme Music
            API latency 1.5초 → 300ms after the 앨범·트랙 split
            Batch memory tuning 2022.9 – 2022.12
            Acme Music
            Peak heap 3.8GB → 1.6GB with chunked transactions
        """.trimIndent()
    }
}
