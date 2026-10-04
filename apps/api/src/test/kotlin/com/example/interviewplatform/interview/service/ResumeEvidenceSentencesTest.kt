package com.example.interviewplatform.interview.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class ResumeEvidenceSentencesTest {
    // Page width: the widest line of the printed resume.
    private val page = "가".repeat(40)
    private val pageWidth = ResumeEvidenceSentences.pageWidthOf(page)

    @Test
    fun `wrapped lines are joined and labels and tech rows are dropped`() {
        val content = """
            개요 정산 데이터를 관리하는 사내 백오피스 플랫폼입니다.
            역할 백엔드 리딩(백엔드 3명, 프론트 2명)으로 도메인 규칙을 설계했습니다.
            기술 Java Spring Boot JPA MySQL
            시퀀스 채번을 SELECT에서 분리해 INSERT 시점으로 옮기고 범위를 한
            번에 할당하도록 바꿨습니다.
            계약 생성 처리 시간을 2분 → 10초로 단축했습니다.
        """.trimIndent()

        val sentences = ResumeEvidenceSentences.select(listOf(content), limit = 4, maxLength = 220, pageWidth = pageWidth)

        assertTrue(sentences.contains("시퀀스 채번을 SELECT에서 분리해 INSERT 시점으로 옮기고 범위를 한 번에 할당하도록 바꿨습니다."), sentences.toString())
        assertTrue(sentences.contains("백엔드 리딩(백엔드 3명, 프론트 2명)으로 도메인 규칙을 설계했습니다."), sentences.toString())
        assertTrue(sentences.none { it.startsWith("기술") || it.startsWith("역할") || it.startsWith("개요") }, sentences.toString())
        assertTrue(sentences.none { it.contains("Spring Boot JPA") }, sentences.toString())
    }

    @Test
    fun `short bullet lines and named items stay separate`() {
        val text = """
            제휴 상점 자동 결제 시스템 구축 및 결제 대행업체 API 연동
            NHN고도몰 API 연동을 통한 상품 데이터 동기화
            ParityPay — 결제·원장 백엔드 (2026.7 – 진행 중): 동시 결제에도 잔액이 어긋나지 않는지 검증
            SysDrill — 장애 대응 훈련 플랫폼 (2026.5 – 진행 중): 장애를 주입하는 워게임
        """.trimIndent()

        val sentences = ResumeEvidenceSentences.select(listOf(text), limit = 4, maxLength = 220, pageWidth = pageWidth)

        assertEquals(4, sentences.size, sentences.toString())
        assertTrue(sentences.any { it.startsWith("SysDrill") }, sentences.toString())
    }

    @Test
    fun `a dated title ends the record and near duplicates merge`() {
        val experience = """
            Acme — Backend developer 2021.12 – 2025.2
            결제 플랫폼을 운영했습니다.
            결제 플랫폼을 운영했습니다. 장애 대응 시간을 30분 → 5분으로 줄였습니다.
            Contents platform rebuild 2024.1 – 2025.2
            이 프로젝트의 내용은 프로젝트 섹션에 있습니다.
        """.trimIndent()

        val sentences = ResumeEvidenceSentences.select(listOf(experience), limit = 4, maxLength = 220, pageWidth = pageWidth)

        assertEquals(listOf("결제 플랫폼을 운영했습니다.", "장애 대응 시간을 30분 → 5분으로 줄였습니다."), sentences)
    }

    @Test
    fun `measured results win when there are more sentences than the limit`() {
        val text = """
            팀에서 주간 회의를 진행했습니다.
            문서를 정리해 공유했습니다.
            메모리 피크를 3.8GB → 1.6GB로 줄였습니다.
            배치 처리 시간을 2시간 → 5분으로 단축했습니다.
        """.trimIndent()

        val sentences = ResumeEvidenceSentences.select(listOf(text), limit = 2, maxLength = 220, pageWidth = pageWidth)

        assertEquals(listOf("메모리 피크를 3.8GB → 1.6GB로 줄였습니다.", "배치 처리 시간을 2시간 → 5분으로 단축했습니다."), sentences)
    }
}
