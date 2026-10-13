package com.example.interviewplatform.user.service

import com.example.interviewplatform.common.storage.UploadArea
import org.springframework.beans.factory.annotation.Value
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID

@Service
class ProfileImageStorageService(
    @Value("\${app.storage.profile-image-dir:uploads/profile-images}")
    private val profileImageDir: String,
    private val jdbcTemplate: JdbcTemplate,
) : UploadArea {
    override val name = "profile-images"

    override val root: Path get() = Paths.get(profileImageDir)

    override fun referencedKeys(): Set<String> =
        jdbcTemplate.queryForList("SELECT profile_image_url FROM user_profiles WHERE profile_image_url IS NOT NULL", String::class.java).map { it.removePrefix(PUBLIC_PREFIX) }.toSet()

    fun store(userId: Long, file: MultipartFile): StoredProfileImage {
        validate(file)
        val uploadDir = Paths.get(profileImageDir).toAbsolutePath().normalize()
        Files.createDirectories(uploadDir)

        val extension = extensionOf(file.originalFilename)
        val fileName = "user-$userId-${UUID.randomUUID()}$extension"
        val targetPath = uploadDir.resolve(fileName)
        file.inputStream.use { input ->
            Files.copy(input, targetPath, StandardCopyOption.REPLACE_EXISTING)
        }
        return StoredProfileImage(
            fileName = fileName,
            contentType = file.contentType!!,
            publicUrl = "$PUBLIC_PREFIX$fileName",
            absolutePath = targetPath,
        )
    }

    /** Deletes the file behind a profile image URL this service issued; other URLs are ignored. */
    fun delete(publicUrl: String) {
        val fileName = publicUrl.removePrefix(PUBLIC_PREFIX)
        if (fileName == publicUrl || fileName.isBlank() || fileName.contains('/') || fileName.contains("..")) {
            return
        }
        val uploadDir = Paths.get(profileImageDir).toAbsolutePath().normalize()
        val target = uploadDir.resolve(fileName).normalize()
        if (target.parent == uploadDir) {
            Files.deleteIfExists(target)
        }
    }

    private fun validate(file: MultipartFile) {
        if (file.isEmpty) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile image file is required")
        }
        val contentType = file.contentType?.lowercase()
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile image content type is required")
        if (contentType !in SUPPORTED_CONTENT_TYPES) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported profile image content type: $contentType")
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile image must be 5 MB or smaller")
        }
    }

    private fun extensionOf(originalFileName: String?): String {
        val sanitized = originalFileName?.substringAfterLast('.', "")?.lowercase().orEmpty()
        return if (sanitized.isBlank()) "" else ".$sanitized"
    }

    data class StoredProfileImage(
        val fileName: String,
        val contentType: String,
        val publicUrl: String,
        val absolutePath: Path,
    )

    private companion object {
        const val MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L
        val SUPPORTED_CONTENT_TYPES = setOf(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif",
        )
    }
}

private const val PUBLIC_PREFIX = "/uploads/profile-images/"
