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
