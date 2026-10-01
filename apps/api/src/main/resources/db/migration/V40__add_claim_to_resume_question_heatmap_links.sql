-- Questions narrowed to one resume claim inside their project or experience (ADR 0084).
-- No foreign key: re-extraction recreates claims, and a stale id simply falls back to matching.
ALTER TABLE resume_question_heatmap_links
    ADD COLUMN achievement_id BIGINT,
    ADD COLUMN achievement_assigned BOOLEAN NOT NULL DEFAULT FALSE;
