package com.example.interviewplatform.common.storage

import com.example.interviewplatform.common.service.ClockService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.nio.file.Files
import java.nio.file.Path
import java.time.Duration
import kotlin.io.path.isRegularFile

/**
 * Deletes uploaded files that no record references any more. A file is written before the row
 * that points to it is committed, so only files older than the grace period are considered.
 * Off unless `app.storage.orphan-sweep.enabled` is set (ADR 0091).
 */
@Component
class OrphanUploadSweeper(
    private val areas: List<UploadArea>,
    private val clockService: ClockService,
    @Value("\${app.storage.orphan-sweep.enabled:false}") private val enabled: Boolean,
    @Value("\${app.storage.orphan-sweep.grace-hours:24}") private val graceHours: Long,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = "\${app.storage.orphan-sweep.cron:0 30 4 * * *}")
    fun scheduledSweep() {
        if (enabled) {
            sweep()
        }
    }

    /** Removes orphans in every area and returns how many files each area lost. */
    fun sweep(): Map<String, Int> = areas.associate { area -> area.name to sweep(area) }

    private fun sweep(area: UploadArea): Int {
        val root = area.root.toAbsolutePath().normalize()
        if (!Files.isDirectory(root)) {
            return 0
        }
        val referenced = area.referencedKeys()
        val cutoff = clockService.now().minus(Duration.ofHours(graceHours))
        var removed = 0
        Files.walk(root).use { paths ->
            paths.filter { it.isRegularFile() }.forEach { file ->
                val key = root.relativize(file).toString().replace('\\', '/')
                val modified = Files.getLastModifiedTime(file).toInstant()
                if (key !in referenced && modified.isBefore(cutoff) && Files.deleteIfExists(file)) {
                    removed += 1
                }
            }
        }
        removeEmptyDirectories(root)
        log.info("upload_orphan_sweep area={} removed={} referenced={}", area.name, removed, referenced.size)
        return removed
    }

    private fun removeEmptyDirectories(root: Path) {
        Files.walk(root).use { paths ->
            paths.sorted(Comparator.reverseOrder())
                .filter { it != root && Files.isDirectory(it) }
                .forEach { directory ->
                    Files.list(directory).use { children ->
                        if (children.findAny().isEmpty) {
                            Files.deleteIfExists(directory)
                        }
                    }
                }
        }
    }
}
