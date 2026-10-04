package com.example.interviewplatform.resume.service

import com.example.interviewplatform.resume.entity.ResumeVersionEntity
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class PlaceholderResumeSignalExtractionService(
    private val objectMapper: ObjectMapper,
) : ResumeSignalExtractionService {
    override fun extract(version: ResumeVersionEntity): ExtractedResumeSignals {
        val sections = ParsedResumeSections.parse(version)
        val experiences = extractExperiences(version, sections)
        val projects = extractProjects(sections, experiences)
        val achievements = extractAchievements(experiences, projects)
        return ExtractedResumeSignals(
            profile = extractProfile(sections),
            contacts = extractContacts(sections),
            competencies = extractCompetencies(sections),
            skills = extractSkills(version, sections),
            experiences = experiences,
            projects = projects,
            achievements = achievements,
            educationItems = extractEducation(sections),
            certificationItems = extractCertifications(sections),
            awardItems = extractAwards(sections),
            risks = extractRisks(version, experiences, achievements),
            sourceType = "deterministic",
            extractionStatus = "skipped",
            extractionErrorMessage = null,
            extractionConfidence = null,
            llmModel = null,
            llmPromptVersion = null,
            rawExtractionPayload = version.parsedJson,
        )
    }

    private fun extractProfile(sections: ParsedResumeSections): ExtractedResumeProfile? {
        val fullName = sections.lines.firstOrNull()
        val headline = sections.lines.firstOrNull { it.contains("Make Non Polynomial Polynomial") || it.startsWith("💡") }
            ?.substringAfter("💡", "")
            ?.trim()
        val summary = sections.summaryLines.takeIf { it.isNotEmpty() }?.joinToString(" ")
        return if (listOf(fullName, headline, summary).all { it.isNullOrBlank() }) {
            null
        } else {
            ExtractedResumeProfile(
                fullName = fullName,
                headline = headline,
                summaryText = null,
                locationText = null,
                yearsOfExperienceText = null,
                sourceText = null,
            )
        }
    }

    private fun extractContacts(sections: ParsedResumeSections): List<ExtractedResumeContactPoint> {
        val contactLine = sections.lines.take(5).joinToString(" ")
        return CONTACT_PATTERNS.mapNotNull { (type, regex) ->
            regex.find(contactLine)?.groupValues?.getOrNull(1)?.trim()?.let { value -> type to value }
        }.mapIndexed { index, (type, value) ->
            ExtractedResumeContactPoint(
                contactType = type,
                label = type,
                valueText = value.takeUnless { it.startsWith("http") },
                url = value.takeIf { it.startsWith("http") },
                displayOrder = index + 1,
                isPrimary = index == 0,
            )
        }
    }

    private fun extractCompetencies(sections: ParsedResumeSections): List<ExtractedResumeCompetency> =
        sections.competencyLines.mapIndexedNotNull { index, line ->
            val normalized = line.removePrefix("•").trim()
            normalized.takeIf { it.isNotBlank() }?.let {
                val title = it.substringBefore('.').takeIf { prefix -> prefix.length in 4..40 } ?: "Core competency ${index + 1}"
                ExtractedResumeCompetency(
                    title = title,
                    description = it,
                    sourceText = it,
                    displayOrder = index + 1,
                )
            }
        }

    private fun extractSkills(version: ResumeVersionEntity, sections: ParsedResumeSections): List<ExtractedResumeSkill> {
        val parsedSkills = parseSkillNames(version.parsedJson)
        if (parsedSkills.isNotEmpty()) {
            return parsedSkills.map {
                ExtractedResumeSkill(
                    skillName = it,
                    sourceText = null,
                    confidenceScore = 0.9,
                )
            }
        }

        val skillSectionText = sections.skillLines.joinToString(" ")
        val rawText = version.rawText.orEmpty()
        return KNOWN_SKILLS.filter { rawText.contains(it, ignoreCase = true) || skillSectionText.contains(it, ignoreCase = true) }.map {
            ExtractedResumeSkill(
                skillName = it,
                sourceText = null,
                confidenceScore = 0.7,
            )
        }
    }

    private fun parseSkillNames(parsedJson: String?): List<String> {
        if (parsedJson.isNullOrBlank()) {
            return emptyList()
        }
        return try {
            val root = objectMapper.readTree(parsedJson)
            collectSkillNames(root).distinct()
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun collectSkillNames(node: JsonNode): List<String> {
        if (node.isArray) {
            return node.mapNotNull { child -> child.asText().trim().takeIf { it.isNotEmpty() } }
        }
        return node.get("skills")?.let(::collectSkillNames).orEmpty()
    }

    private fun extractExperiences(
        version: ResumeVersionEntity,
        sections: ParsedResumeSections,
    ): List<ExtractedResumeExperience> {
        val grouped = sections.careerEntries.takeIf { it.isNotEmpty() } ?: fallbackExperienceGroups(version, sections)
        return grouped.take(6).mapIndexed { index, entry ->
            val header = parseCareerHeader(entry.firstOrNull().orEmpty())
            val sourceText = entry.joinToString("\n")
            ExtractedResumeExperience(
                projectName = null,
                companyName = header.companyName,
                roleName = header.roleName,
                employmentType = null,
                startedOn = header.startedOn,
                endedOn = header.endedOn,
                isCurrent = header.isCurrent,
                // Body lines before the first project title inside the entry; the projects carry
                // their own detail. Lines stay separate so evidence can be read line by line.
                summaryText = entry.drop(1)
                    .takeWhile { resumeDateRangeOutsideParentheses(it) == null }
                    .take(3)
                    .joinToString("\n")
                    .ifBlank { entry.firstOrNull().orEmpty() },
                impactText = entry.firstOrNull { line -> IMPACT_HINTS.any { hint -> line.contains(hint, ignoreCase = true) } || line.contains("→") },
                sourceText = sourceText,
                riskLevel = riskLevelFor(sourceText),
                displayOrder = index + 1,
            )
        }
    }

    // The name, headline and contact lines at the top are not experience; a parsed summary that
    // merely repeats them is skipped too, so the interview never anchors on the header.
    private fun fallbackExperienceGroups(version: ResumeVersionEntity, sections: ParsedResumeSections): List<List<String>> {
        val headerText = sections.headerLines.joinToString(" ")
        val source = buildString {
            val summary = version.summaryText?.trim().orEmpty()
            if (summary.isNotBlank() && !headerText.startsWith(summary.trimEnd('.'))) {
                appendLine(summary)
            }
            sections.lines.drop(sections.headerLines.size).forEach(::appendLine)
        }.trim()
        return source.split('.', '\n')
            .map { it.trim() }
            .filter { it.length >= 20 }
            .take(3)
            .map { listOf(it) }
    }

    private fun extractProjects(
        sections: ParsedResumeSections,
        experiences: List<ExtractedResumeExperience>,
    ): List<ExtractedResumeProject> =
        sections.projectEntries.take(12).mapIndexed { index, rawEntry ->
            val header = parseProjectHeader(rawEntry.firstOrNull().orEmpty())
            // A detailed project write-up often names the company on the line under the title.
            val owner = rawEntry.getOrNull(1)?.let { line ->
                experiences.firstOrNull { experience ->
                    experience.companyName?.let { compact(it) == compact(line) } == true
                }
            }
            val entry = if (owner != null) rawEntry.filterIndexed { lineIndex, _ -> lineIndex != 1 } else rawEntry
            val sourceText = entry.joinToString(" ")
            val contentText = entry.drop(1).joinToString("\n").ifBlank { null }
            val category = inferProjectCategory(sourceText)
            ExtractedResumeProject(
                title = header.title ?: "Project ${index + 1}",
                organizationName = owner?.companyName ?: experiences.getOrNull(index)?.companyName,
                roleName = null,
                summaryText = entry.drop(1).take(4).joinToString(" ").ifBlank { sourceText },
                contentText = contentText,
                projectCategoryCode = category?.first,
                projectCategoryName = category?.second,
                tags = inferProjectTags(sourceText),
                techStackText = entry.firstOrNull { it.startsWith("기술 ") || it.startsWith("기술스택 ") },
                startedOn = header.startedOn,
                endedOn = header.endedOn,
                displayOrder = index + 1,
                sourceText = sourceText,
                experienceDisplayOrder = owner?.displayOrder ?: experiences.getOrNull(index)?.displayOrder,
            )
        }

    private fun compact(value: String): String = value.replace(Regex("\\s+"), "")

    private fun extractAchievements(
        experiences: List<ExtractedResumeExperience>,
        projects: List<ExtractedResumeProject>,
    ): List<ExtractedResumeAchievement> {
        val sourceLines = buildList<AchievementSource> {
            experiences.forEach {
                add(
                    AchievementSource(
                        sourceText = it.sourceText,
                        experienceDisplayOrder = it.displayOrder,
                        projectDisplayOrder = null,
                    ),
                )
            }
            projects.forEach {
                add(
                    AchievementSource(
                        sourceText = it.contentText ?: it.sourceText ?: it.summaryText,
                        experienceDisplayOrder = it.experienceDisplayOrder,
                        projectDisplayOrder = it.displayOrder,
                    ),
                )
            }
        }
        return sourceLines
            .mapNotNull { source ->
                if (source.sourceText.contains("→") || source.sourceText.contains("%") || source.sourceText.contains("배") || source.sourceText.contains("건")) source else null
            }
            .flatMap { source ->
                source.sourceText
                    // A middle dot between words ("앨범·트랙") is not a bullet; only a spaced one is.
                    .split("•", " · ", "\n")
                    .map { it.trim() }
                    .filter { it.isNotBlank() && (it.contains("→") || METRIC_PATTERN.containsMatchIn(it)) }
                    .ifEmpty { listOf(source.sourceText) }
                    .map { line -> source to line }
            }
            .distinctBy { (_, line) -> line }
            .take(20)
            .mapIndexed { index, (source, line) ->
                val metric = METRIC_PATTERN.find(line)?.value
                ExtractedResumeAchievement(
                    title = line.substringBefore("→").substringBefore(":").trim().ifBlank { "Achievement ${index + 1}" },
                    metricText = metric,
                    impactSummary = line,
                    sourceText = line,
                    severityHint = if (metric != null) "high" else "medium",
                    displayOrder = index + 1,
                    experienceDisplayOrder = source.experienceDisplayOrder,
                    projectDisplayOrder = source.projectDisplayOrder,
                )
            }
    }

    private fun extractEducation(sections: ParsedResumeSections): List<ExtractedResumeEducation> =
        sections.educationLines.mapIndexedNotNull { index, line ->
            val dated = parseDatedEntry(line)
            val body = line.removePrefix("•")
                .replace(RANGE_PATTERN, " ")
                .trim()
                .ifBlank { dated?.body.orEmpty() }
            body.takeIf { it.isNotBlank() }?.let {
                ExtractedResumeEducation(
                    institutionName = inferEducationInstitutionName(it, index + 1),
                    degreeName = inferEducationDegreeName(it),
                    fieldOfStudy = inferFieldOfStudy(it),
                    startedOn = dated?.startedOn,
                    endedOn = dated?.endedOn,
                    description = it,
                    displayOrder = index + 1,
                    sourceText = line,
                )
            }
        }

    private fun extractCertifications(sections: ParsedResumeSections): List<ExtractedResumeCertification> =
        sections.certificationLines.mapIndexedNotNull { index, line ->
            val parts = line.removePrefix("•").split("|").map { it.trim() }
            val name = parts.firstOrNull().orEmpty().substringBefore("(").trim()
            name.takeIf { it.isNotBlank() }?.let {
                ExtractedResumeCertification(
                    name = it,
                    issuerName = parts.getOrNull(1),
                    credentialCode = CERT_CODE_PATTERN.find(line)?.value,
                    issuedOn = parseSingleDate(line),
                    expiresOn = null,
                    scoreText = SCORE_PATTERN.find(line)?.value,
                    displayOrder = index + 1,
                    sourceText = line,
                )
            }
        }

    private fun extractAwards(sections: ParsedResumeSections): List<ExtractedResumeAward> =
        sections.awardLines.mapIndexedNotNull { index, line ->
            val awardedOn = parseSingleDate(line)
            val body = line.removePrefix("•").trim().substringAfter(Regex("\\d{4}\\.\\d{1,2}").find(line)?.value ?: "").trim()
            body.takeIf { it.isNotBlank() }?.let {
                ExtractedResumeAward(
                    title = it.substringBefore("(").substringBefore("|").trim().ifBlank { "Award ${index + 1}" },
                    issuerName = inferAwardIssuer(it),
                    awardedOn = awardedOn,
                    description = it,
                    displayOrder = index + 1,
                    sourceText = line,
                )
            }
        }

    private fun extractRisks(
        version: ResumeVersionEntity,
        experiences: List<ExtractedResumeExperience>,
        achievements: List<ExtractedResumeAchievement>,
    ): List<ExtractedResumeRisk> = (experiences
        .filter { it.riskLevel == "high" || it.sourceText.contains('%') }
        .map {
            ExtractedResumeRisk(
                riskType = if (it.sourceText.contains('%')) "impact_claim" else "experience_claim",
                title = "Resume claim needs follow-up defense",
                description = "Be ready to defend this claim from resume version ${version.versionNo}: ${it.sourceText}",
                severity = it.riskLevel.uppercase(),
            )
        } + achievements
        .filter { it.metricText != null }
        .map {
            ExtractedResumeRisk(
                riskType = "achievement_claim",
                title = "Measured achievement needs evidence",
                description = "Be ready to explain the evidence and method behind: ${it.impactSummary}",
                severity = "HIGH",
            )
        }).distinctBy { it.riskType to it.description }

    private fun parseCareerHeader(line: String): CareerHeader {
        val normalized = line.trim()
        val rangeMatch = resumeDateRangeOutsideParentheses(normalized)
        val (startedOn, endedOn, isCurrent) = parseRange(rangeMatch?.value)
        val prefix = rangeMatch?.let { normalized.substring(0, it.range.first) }?.trim() ?: normalized
        val parts = prefix.split(TITLE_SEPARATOR).map { it.trim() }
        return CareerHeader(
            companyName = parts.getOrNull(0),
            roleName = parts.getOrNull(1)?.substringBefore(" · ")?.trim(),
            startedOn = startedOn,
            endedOn = endedOn,
            isCurrent = isCurrent,
        )
    }

    private fun parseProjectHeader(line: String): ProjectHeader {
        val normalized = line.trim()
        val rangeMatch = resumeDateRangeOutsideParentheses(normalized)
        val (startedOn, endedOn, _) = parseRange(rangeMatch?.value)
        val title = if (rangeMatch != null) {
            normalized.substring(0, rangeMatch.range.first).trim().takeIf { it.isNotBlank() }
        } else {
            normalized.takeIf { it.isNotBlank() }
        }
        return ProjectHeader(title = title, startedOn = startedOn, endedOn = endedOn)
    }

    private fun parseDatedEntry(line: String): DatedEntry? {
        val rangeMatch = RANGE_PATTERN.find(line) ?: return null
        val (startedOn, endedOn, _) = parseRange(rangeMatch.value)
        val body = line.substringAfter(rangeMatch.value).trim()
        return DatedEntry(startedOn, endedOn, body)
    }

    private fun parseSingleDate(line: String): LocalDate? =
        SINGLE_DATE_PATTERN.find(line)?.let { toLocalDate(it.value) }

    private fun parseRange(value: String?): Triple<LocalDate?, LocalDate?, Boolean> {
        if (value.isNullOrBlank()) return Triple(null, null, false)
        val parts = value.split(RANGE_SEPARATOR, limit = 2).map { it.trim() }
        val started = parts.getOrNull(0)?.let(::toLocalDate)
        val endText = parts.getOrNull(1)
        val isCurrent = endText?.let { OPEN_END_PATTERN.containsMatchIn(it) } == true
        val ended = endText?.takeUnless { isCurrent }?.let(::toLocalDate)
        return Triple(started, ended, isCurrent)
    }

    private fun toLocalDate(token: String): LocalDate? {
        val match = SINGLE_DATE_PATTERN.find(token) ?: return null
        val year = match.groupValues[1].toInt()
        val month = match.groupValues[2].toInt()
        val day = match.groupValues.getOrNull(3)?.takeIf { it.isNotBlank() }?.toInt() ?: 1
        return runCatching { LocalDate.of(year, month, day) }.getOrNull()
    }

    private fun riskLevelFor(sourceText: String): String = when {
        sourceText.contains('%') -> "high"
        RISK_HINTS.any { sourceText.contains(it, ignoreCase = true) } -> "medium"
        else -> "low"
    }

    private fun inferProjectCategory(sourceText: String): Pair<String, String>? {
        val normalized = sourceText.lowercase()
        return when {
            listOf("payment", "checkout", "billing", "결제").any { normalized.contains(it) } -> "payments" to "Payments"
            listOf("search", "recommend", "ranking", "추천").any { normalized.contains(it) } -> "recommendation" to "Recommendation"
            listOf("infra", "platform", "deployment", "ci/cd", "observability").any { normalized.contains(it) } -> "platform" to "Platform"
            listOf("data", "analytics", "etl", "warehouse").any { normalized.contains(it) } -> "data" to "Data"
            else -> null
        }
    }

    private fun inferProjectTags(sourceText: String): List<ExtractedResumeProjectTag> {
        val normalized = sourceText.lowercase()
        return PROJECT_TAG_RULES.mapNotNull { rule ->
            if (rule.keywords.any { normalized.contains(it) }) {
                ExtractedResumeProjectTag(
                    tagName = rule.tagName,
                    tagType = rule.tagType,
                    displayOrder = rule.displayOrder,
                    sourceText = sourceText,
                )
            } else {
                null
            }
        }
    }

    private companion object {
        val KNOWN_SKILLS = listOf("Spring Boot", "Kotlin", "Java", "Go", "Python", "JPA", "QueryDSL", "MySQL", "Redis", "RabbitMQ", "SQS", "Docker", "AWS")
        val IMPACT_HINTS = listOf("improved", "reduced", "increased", "latency", "throughput", "개선", "단축")
        val RISK_HINTS = listOf("designed", "built", "scaled", "migrated", "introduced", "improved", "설계", "구축")
        val CONTACT_PATTERNS = listOf(
            "phone" to Regex("""(?:Contact|Tel|Phone)\s*:?\s*(\+?[0-9][0-9\-() ]{6,}[0-9])"""),
            "blog" to Regex("""Blog\s*:?\s*((?:https?://)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}\S*)"""),
            "email" to Regex("""Mail\s*:?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})"""),
            "github" to Regex("""GitHub\s*:?\s*((?:https?://)?github\.com/\S+)""", RegexOption.IGNORE_CASE),
        )
        val RANGE_PATTERN = RESUME_DATE_RANGE
        val RANGE_SEPARATOR = Regex("""\s*[~–—-]\s*""")
        val OPEN_END_PATTERN = Regex("""현재|진행\s?중|present""", RegexOption.IGNORE_CASE)
        val SINGLE_DATE_PATTERN = Regex("""(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?""")
        val METRIC_PATTERN = Regex("""\d+(?:\.\d+)?(?:%|배|건|GB|MB|초|분|시간)""")
        val CERT_CODE_PATTERN = Regex("""[A-Z0-9-]{5,}""")
        val SCORE_PATTERN = Regex("""\b\d{3,4}점\b""")
        val PROJECT_TAG_RULES = listOf(
            ProjectTagRule("backend", "domain", 1, listOf("backend", "api", "spring", "kotlin", "java")),
            ProjectTagRule("payments", "business", 2, listOf("payment", "checkout", "billing", "결제")),
            ProjectTagRule("performance", "quality", 3, listOf("latency", "throughput", "cache", "성능", "개선")),
            ProjectTagRule("infra", "domain", 4, listOf("infra", "platform", "deployment", "ci/cd", "docker", "aws")),
            ProjectTagRule("data", "domain", 5, listOf("data", "etl", "analytics", "warehouse", "pipeline")),
        )
    }
}

// "Company — Role" or "Company - Role" in an entry title.
private val TITLE_SEPARATOR = Regex("""\s[-–—]\s""")

private data class ParsedResumeSections(
    val lines: List<String>,
    val headerLines: List<String>,
    val summaryLines: List<String>,
    val skillLines: List<String>,
    val competencyLines: List<String>,
    val educationLines: List<String>,
    val awardLines: List<String>,
    val certificationLines: List<String>,
    val careerEntries: List<List<String>>,
    val projectEntries: List<List<String>>,
) {
    companion object {
        // Plain section titles used by many resumes. 경력기술서 is a per-project write-up, so its
        // titled blocks are read as projects.
        private val SECTION_TITLES = mapOf(
            "SUMMARY" to "summary",
            "ABOUT ME" to "summary",
            "CAREER" to "career",
            "EXPERIENCE" to "career",
            "WORK EXPERIENCE" to "career",
            "PROFESSIONAL EXPERIENCE" to "career",
            "PROJECTS" to "projects",
            "SKILLS" to "skills",
            "TECH STACK" to "skills",
            "EDUCATION" to "education",
            "AWARDS" to "awards",
            "CERTIFICATIONS" to "certifications",
            "CERTIFICATES" to "certifications",
            "경력기술서" to "projects",
        )

        fun parse(version: ResumeVersionEntity): ParsedResumeSections {
            val lines = version.rawText.orEmpty()
                .lines()
                .map { it.trim() }
                .filter { it.isNotBlank() }
            val sections = linkedMapOf<String, MutableList<String>>()
            var current = "intro"
            sections[current] = mutableListOf()
            lines.forEach { line ->
                val nextSection = when {
                    current != "projects" && line.contains("기술스택") -> "skills"
                    line.contains("보유 역량") -> "competencies"
                    line.contains("교육 및 활동") -> "education"
                    line.contains("수상이력") -> "awards"
                    line.contains("자격사항") -> "certifications"
                    line == "💼 경력" || line == "경력" -> "career"
                    line == "📜 프로젝트" || line == "프로젝트" -> "projects"
                    else -> SECTION_TITLES[line.uppercase()]
                }
                if (nextSection != null) {
                    current = nextSection
                    sections.computeIfAbsent(current) { mutableListOf() }
                } else {
                    sections.computeIfAbsent(current) { mutableListOf() }.add(line)
                }
            }
            val intro = sections["intro"].orEmpty()
            return ParsedResumeSections(
                lines = lines,
                headerLines = resumeHeaderLines(intro),
                summaryLines = sections["summary"]?.take(6) ?: intro.drop(5).take(6),
                skillLines = sections["skills"].orEmpty(),
                competencyLines = sections["competencies"].orEmpty(),
                educationLines = sections["education"].orEmpty().filter(::isContentLine),
                awardLines = sections["awards"].orEmpty().filter(::isContentLine),
                certificationLines = sections["certifications"].orEmpty().filter(::isContentLine),
                careerEntries = groupCareerEntries(sections["career"].orEmpty()),
                projectEntries = groupProjectEntries(sections["projects"].orEmpty()),
            )
        }

        private fun groupCareerEntries(lines: List<String>): List<List<String>> {
            val results = mutableListOf<MutableList<String>>()
            lines.forEach { line ->
                val range = resumeDateRangeOutsideParentheses(line)
                if (range != null && TITLE_SEPARATOR.containsMatchIn(line.substring(0, range.range.first))) {
                    results.add(mutableListOf(line))
                } else if (results.isNotEmpty()) {
                    results.last().add(line)
                }
            }
            return results
        }

        private fun groupProjectEntries(lines: List<String>): List<List<String>> {
            val results = mutableListOf<MutableList<String>>()
            lines.forEach { line ->
                val range = resumeDateRangeOutsideParentheses(line)
                val titled = range != null && line.substring(0, range.range.first).isNotBlank()
                if (!line.startsWith("문제") && !line.startsWith("개선") && !line.startsWith("성과") && titled) {
                    results.add(mutableListOf(line))
                } else if (results.isNotEmpty()) {
                    results.last().add(line)
                }
            }
            if (results.isEmpty() && lines.isNotEmpty()) {
                return listOf(lines.toMutableList())
            }
            return results
        }

        private fun isContentLine(line: String): Boolean {
            val normalized = line.trim()
            if (normalized.isBlank()) {
                return false
            }
            return !normalized.startsWith("📜") &&
                !normalized.startsWith("💼") &&
                !normalized.contains("교육 및 활동") &&
                !normalized.contains("수상이력") &&
                !normalized.contains("자격사항")
        }
    }
}

private data class CareerHeader(
    val companyName: String?,
    val roleName: String?,
    val startedOn: LocalDate?,
    val endedOn: LocalDate?,
    val isCurrent: Boolean,
)

private data class ProjectHeader(
    val title: String?,
    val startedOn: LocalDate?,
    val endedOn: LocalDate?,
)

private data class DatedEntry(
    val startedOn: LocalDate?,
    val endedOn: LocalDate?,
    val body: String,
)

private data class AchievementSource(
    val sourceText: String,
    val experienceDisplayOrder: Int?,
    val projectDisplayOrder: Int?,
)

private data class ProjectTagRule(
    val tagName: String,
    val tagType: String,
    val displayOrder: Int,
    val keywords: List<String>,
)

private fun inferEducationInstitutionName(body: String, displayOrder: Int): String {
    val normalized = body.substringBefore("|").substringBefore(",").trim()
    return when {
        normalized.contains("대학교") || normalized.contains("대학") || normalized.contains("부트캠프") || normalized.contains("아카데미") -> normalized
        else -> "Education ${displayOrder}"
    }
}

private fun inferEducationDegreeName(body: String): String? = when {
    body.contains("학사") -> "학사"
    body.contains("석사") -> "석사"
    body.contains("박사") -> "박사"
    body.contains("졸업") -> body.substringAfterLast(" ").takeIf { it.isNotBlank() }
    else -> null
}

private fun inferFieldOfStudy(body: String): String? = listOf("컴퓨터공학", "소프트웨어", "정보통신", "전자공학", "산업공학")
    .firstOrNull { body.contains(it) }

private fun inferAwardIssuer(body: String): String? {
    val parts = body.split("|").map { it.trim() }.filter { it.isNotBlank() }
    if (parts.size >= 2) {
        return parts.last()
    }
    return body.substringAfterLast(" ").takeIf { it.isNotBlank() && it != body }
}
