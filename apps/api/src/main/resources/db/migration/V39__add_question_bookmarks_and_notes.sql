-- 보관함 (ADR 0083): questions a user saved, and one private note per question.
CREATE TABLE question_bookmarks (
    user_id BIGINT NOT NULL REFERENCES users(id),
    question_id BIGINT NOT NULL REFERENCES questions(id),
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (user_id, question_id)
);

CREATE INDEX idx_question_bookmarks_user_created ON question_bookmarks (user_id, created_at DESC);

CREATE TABLE question_notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    question_id BIGINT NOT NULL REFERENCES questions(id),
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_question_notes_user_question UNIQUE (user_id, question_id)
);

CREATE INDEX idx_question_notes_user_updated ON question_notes (user_id, updated_at DESC);
