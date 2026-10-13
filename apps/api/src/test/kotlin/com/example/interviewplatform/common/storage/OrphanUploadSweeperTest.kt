package com.example.interviewplatform.common.storage

import com.example.interviewplatform.common.service.ClockService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.attribute.FileTime
import java.time.Duration
import java.time.Instant

class OrphanUploadSweeperTest {
    @TempDir
    lateinit var root: Path

    @Test
    fun `removes only unreferenced files older than the grace period, and their empty folders`() {
        val old = Instant.now().minus(Duration.ofDays(3))
        val kept = write("user-1/resume-1/kept.pdf", old)
        val orphan = write("user-2/resume-9/orphan.pdf", old)
        val fresh = write("user-3/resume-4/just-uploaded.pdf", Instant.now())
        val area = object : UploadArea {
            override val name = "resume-files"
            override val root = this@OrphanUploadSweeperTest.root
            override fun referencedKeys() = setOf("user-1/resume-1/kept.pdf")
        }

        val removed = OrphanUploadSweeper(listOf(area), ClockService(), enabled = true, graceHours = 24).sweep()

        assertEquals(mapOf("resume-files" to 1), removed)
        assertTrue(Files.exists(kept))
        assertFalse(Files.exists(orphan))
        assertFalse(Files.exists(root.resolve("user-2")))
        assertTrue(Files.exists(fresh))
    }

    @Test
    fun `a missing area directory is skipped`() {
        val area = object : UploadArea {
            override val name = "interview-audio"
            override val root: Path = this@OrphanUploadSweeperTest.root.resolve("missing")
            override fun referencedKeys() = emptySet<String>()
        }

        assertEquals(mapOf("interview-audio" to 0), OrphanUploadSweeper(listOf(area), ClockService(), true, 24).sweep())
    }

    private fun write(key: String, modified: Instant): Path {
        val file = root.resolve(key)
        Files.createDirectories(file.parent)
        Files.writeString(file, key)
        Files.setLastModifiedTime(file, FileTime.from(modified))
        return file
    }
}
