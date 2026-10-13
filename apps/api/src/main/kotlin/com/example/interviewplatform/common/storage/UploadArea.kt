package com.example.interviewplatform.common.storage

import java.nio.file.Path

/**
 * One directory of user uploads and the records that point into it. The domain that writes the
 * files owns the area and knows which of them are still in use (ADR 0091).
 */
interface UploadArea {
    val name: String

    /** The directory holding the area's files. */
    val root: Path

    /** Paths relative to [root], with forward slashes, that some record still references. */
    fun referencedKeys(): Set<String>
}
