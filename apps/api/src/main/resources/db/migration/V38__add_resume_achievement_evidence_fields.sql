-- Per-claim evidence the user writes for a resume achievement (ADR 0081).
-- Extraction never fills these; re-extraction carries them over by claim title.
ALTER TABLE resume_achievement_items
    ADD COLUMN situation_text TEXT,
    ADD COLUMN role_text TEXT,
    ADD COLUMN measurement_text TEXT,
    ADD COLUMN result_text TEXT,
    ADD COLUMN evidence_updated_at TIMESTAMPTZ;
