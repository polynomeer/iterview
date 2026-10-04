package com.example.interviewplatform.resume.service

private val CONTACT_HINT =
    Regex("""@|https?://|\b(?:Tel|Phone|Mail|Email|Blog|GitHub|Contact)\b|\d{2,3}-\d{3,4}-\d{4}""", RegexOption.IGNORE_CASE)

/**
 * The name, headline and contact lines at the top of a resume: everything up to the last contact
 * line among the first few lines, or just the first line when there is no contact line. These lines
 * identify the person; they are never experience or interview evidence.
 */
fun resumeHeaderLines(lines: List<String>): List<String> {
    val lastContact = lines.take(6).indexOfLast { CONTACT_HINT.containsMatchIn(it) }
    return lines.take(if (lastContact >= 0) lastContact + 1 else minOf(1, lines.size))
}

/** "2021.12 – 2025.2", "2024.01 ~ 현재", "2026.7 - 진행 중": a period on a resume line. */
val RESUME_DATE_RANGE =
    Regex("""(\d{4}\.\d{1,2}(?:\.\d{1,2})?)\s*[~–—-]\s*(\d{4}\.\d{1,2}(?:\.\d{1,2})?|현재|진행\s?중|[Pp]resent)""")

/**
 * The first date range on a line that is not inside parentheses. Entry titles carry their period
 * this way ("Contents platform rebuild 2024.1 – 2025.2"), while "개편(2024.1–2024.11)을 마친 뒤"
 * or "ParityPay — 결제 (2026.7 – 진행 중)" is body text.
 */
fun resumeDateRangeOutsideParentheses(line: String): MatchResult? =
    RESUME_DATE_RANGE.findAll(line).firstOrNull { match ->
        val before = line.substring(0, match.range.first)
        before.count { it == '(' } <= before.count { it == ')' }
    }
