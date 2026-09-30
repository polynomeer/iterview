package com.example.interviewplatform.resume.repository

import com.example.interviewplatform.resume.entity.ResumeEditorPresenceSessionEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import java.time.Instant

interface ResumeEditorPresenceSessionRepository : JpaRepository<ResumeEditorPresenceSessionEntity, Long> {
    fun findByResumeEditorWorkspaceIdAndSessionKey(
        resumeEditorWorkspaceId: Long,
        sessionKey: String,
    ): ResumeEditorPresenceSessionEntity?

    fun findByResumeEditorWorkspaceIdOrderByUpdatedAtDesc(resumeEditorWorkspaceId: Long): List<ResumeEditorPresenceSessionEntity>

    /**
     * Heartbeats for the same browser session can arrive concurrently (for example two tabs'
     * effects firing together), so the row is written in one statement instead of find-then-save.
     */
    @Modifying
    @Query(
        value = """
            insert into resume_editor_presence_sessions (
                resume_editor_workspace_id,
                user_id,
                session_key,
                view_mode,
                selected_block_id,
                created_at,
                updated_at
            ) values (
                :workspaceId,
                :userId,
                :sessionKey,
                :viewMode,
                :selectedBlockId,
                :now,
                :now
            )
            on conflict (resume_editor_workspace_id, session_key) do update
            set user_id = excluded.user_id,
                view_mode = excluded.view_mode,
                selected_block_id = excluded.selected_block_id,
                updated_at = excluded.updated_at
        """,
        nativeQuery = true,
    )
    fun upsert(
        workspaceId: Long,
        userId: Long,
        sessionKey: String,
        viewMode: String?,
        selectedBlockId: String?,
        now: Instant,
    )
}
