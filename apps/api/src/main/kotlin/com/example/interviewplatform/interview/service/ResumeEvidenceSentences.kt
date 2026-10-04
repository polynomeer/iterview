package com.example.interviewplatform.interview.service

import com.example.interviewplatform.resume.service.resumeDateRangeOutsideParentheses

/**
 * Turns the stored text of one resume record into a few interview-worthy sentences.
 *
 * Resume text arrives as PDF lines: paragraphs wrapped at the page width, labelled rows
 * ("역할 …", "기술 …"), short headings and project titles with their period. The interviewer
 * needs whole claims, so wrapped lines are joined back, labels and tech-stack rows are dropped,
 * text is split at sentence ends only (never at commas), near-duplicates are merged, and the
 * sentences that state an action or a measured result are preferred.
 */
object ResumeEvidenceSentences {
    private const val MIN_LENGTH = 15
    private const val WRAPPED_LINE_RATIO = 0.8

    private val FIELD_LABEL = Regex("""^(개요|역할|과제|성과|결과|배경|담당)\s*[:：]?\s+""")
    private val TECH_ROW = Regex("""^(기술|기술스택|기술 스택|Tech|Stack|Skills)\s*[:：]?\s+""", RegexOption.IGNORE_CASE)
    private val BULLET = Regex("""^[•·▪◦\-–—*]\s*""")
    // "ParityPay — 결제·원장 백엔드 …": a named item, never the tail of the previous line.
    private val NAMED_ITEM = Regex("""^\S.{0,40}?\s[—–]\s""")
    private val SENTENCE_END = Regex("""(?<=[\p{L})][.!?])\s+""")
    private val ENDS_SENTENCE = Regex("""[.!?]["”')]?$""")
    private val METRIC = Regex(
        """\d+(?:[.,]\d+)?\s*(?:%|배|건|초|분|시간|억|(?:ms|s|GB|MB|KB|x)(?!\p{L}))|→|⇒|->""",
        RegexOption.IGNORE_CASE,
    )
    private val ACTION = Regex(
        """설계|재설계|전환|도입|구축|개선|분리|적용|자동화|해결|단축|줄였|줄이|높였|최적화|구현|개발|이관|표준화|검증|""" +
            """designed|built|led|migrated|reduced|improved|implemented|automated|introduced|optimized""",
        RegexOption.IGNORE_CASE,
    )

    /**
     * Picks at most [limit] sentences, in the order they appear in [texts]. [pageWidth] is the
     * widest line of the whole resume; a line close to it was wrapped by the page. Without it the
     * widest line of the record stands in.
     */
    fun select(texts: List<String?>, limit: Int, maxLength: Int, pageWidth: Int? = null): List<String> {
        val sentences = texts
            .filterNotNull()
            .flatMap { text -> logicalLines(text, pageWidth) }
            .flatMap { line -> line.text.split(SENTENCE_END).map { Sentence(it.trim(), line.overview) } }
            .filter { it.text.length >= MIN_LENGTH }
        val distinct = mergeNearDuplicates(sentences)
        val chosen = distinct
            .withIndex()
            .sortedWith(compareByDescending<IndexedValue<Sentence>> { score(it.value) }.thenBy { it.index })
            .take(limit)
            .sortedBy { it.index }
        return chosen.map { shorten(it.value.text, maxLength) }
    }

    private data class Sentence(val text: String, val overview: Boolean)

    private data class LogicalLine(val text: String, val overview: Boolean)

    fun pageWidthOf(text: String?): Int? = text?.lines()?.maxOfOrNull { displayWidth(it.trim()) }?.takeIf { it > 0 }

    private fun logicalLines(text: String, pageWidth: Int?): List<LogicalLine> {
        val lines = text.lines().map { it.replace(Regex("\\s+"), " ").trim() }.filter { it.isNotBlank() }
        val body = mutableListOf<String>()
        for ((index, line) in lines.withIndex()) {
            if (resumeDateRangeOutsideParentheses(line) != null) {
                // A dated title: the record's own title line is skipped, a later one starts
                // another record's detail (a project inside an experience), so stop there.
                if (index == 0) continue else break
            }
            body += line
        }
        val widest = pageWidth ?: body.maxOfOrNull(::displayWidth) ?: return emptyList()
        val joined = mutableListOf<String>()
        body.forEach { line ->
            val previous = joined.lastOrNull()
            val continuesPrevious = previous != null &&
                !ENDS_SENTENCE.containsMatchIn(previous) &&
                displayWidth(previous.substringAfterLast('\n')) >= widest * WRAPPED_LINE_RATIO &&
                !FIELD_LABEL.containsMatchIn(line) &&
                !TECH_ROW.containsMatchIn(line) &&
                !BULLET.containsMatchIn(line) &&
                !NAMED_ITEM.containsMatchIn(line)
            if (continuesPrevious) {
                joined[joined.lastIndex] = previous + "\n" + line
            } else {
                joined += line
            }
        }
        return joined
            .filterNot { TECH_ROW.containsMatchIn(it) }
            .map { line ->
                val flat = line.replace("\n", " ").replace(BULLET, "")
                val label = FIELD_LABEL.find(flat)
                LogicalLine(
                    text = if (label != null) flat.substring(label.range.last + 1) else flat,
                    overview = label?.groupValues?.get(1) == "개요",
                )
            }
    }

    // Korean and other wide glyphs take two columns, so line widths compare like the printed page.
    private fun displayWidth(value: String): Int = value.sumOf { if (it.code >= 0x1100) 2 else 1 }

    private fun mergeNearDuplicates(sentences: List<Sentence>): List<Sentence> {
        val kept = mutableListOf<Sentence>()
        sentences.forEach { candidate ->
            val key = compact(candidate.text)
            val containedIndex = kept.indexOfFirst { compact(it.text).contains(key) || key.contains(compact(it.text)) }
            when {
                containedIndex < 0 -> kept += candidate
                key.length > compact(kept[containedIndex].text).length -> kept[containedIndex] = candidate
            }
        }
        return kept
    }

    private fun compact(value: String): String = value.lowercase().replace(Regex("[^\\p{L}\\p{N}]"), "")

    private fun score(sentence: Sentence): Int {
        var score = 0
        if (METRIC.containsMatchIn(sentence.text)) score += 3
        if (ACTION.containsMatchIn(sentence.text)) score += 2
        if (ENDS_SENTENCE.containsMatchIn(sentence.text)) score += 1
        if (sentence.overview) score -= 2
        if (sentence.text.length < 30) score -= 1
        return score
    }

    private fun shorten(text: String, maxLength: Int): String {
        if (text.length <= maxLength) return text
        val cut = text.take(maxLength - 1)
        val boundary = cut.lastIndexOf(' ').takeIf { it >= maxLength / 2 } ?: cut.length
        return cut.take(boundary).trimEnd(' ', ',', '·') + "…"
    }
}
