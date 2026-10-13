# 0091. Uploads Live as Long as the Records That Reference Them

## Status
Accepted.

## Date
2026-10-13

## Context
The API keeps four kinds of uploads on disk: resume PDFs, profile images, interview audio and tailored resume exports. Nothing ever deleted one, so files outlived their purpose:
- Replacing a profile image left the old file behind.
- A file is written before the row that points to it. If saving the row failed, the file stayed with nothing referencing it.
- API integration tests wrote into the developer's own `apps/api/uploads`. A local checkout had about 300 interview audio files for 2 interview records.

How long recordings should be kept at all is a separate product question and is not decided here.

## Decision
- An uploaded file lives as long as a record references it. Each storage service is an `UploadArea`: it names the directory it writes and reads the keys still in use from its own table.
  - Resume PDFs: `resume_versions.storage_key`.
  - Profile images: `user_profiles.profile_image_url`.
  - Interview audio: `interview_records.source_audio_file_url`.
  - Exports: `resume_analysis_exports.storage_key`.
- `OrphanUploadSweeper` deletes files under an area's directory that no record references and that are older than a grace period (24 hours by default), so a file whose row is still being written is never taken. It then removes the empty folders left behind. It runs on a schedule (04:30 daily by default). It is off unless `app.storage.orphan-sweep.enabled` is set; the local profile turns it on.
- Replacing a profile image deletes the previous file once the new URL is committed.
- The `test` profile points every upload directory at `build/test-uploads`, so tests never write into a developer's uploads.

## Consequences
- Disk use follows the data the product still shows.
- The sweeper loads every referenced key of an area into memory. That is fine at today's scale; a much larger store would need a batched comparison.
- A new kind of upload must implement `UploadArea`, or the sweeper never sees it. A file outside every area is never touched.
- Turning the sweeper on in production is an operator step. Deleted files cannot be recovered without a backup.
- Recordings and exports that a record still references are kept indefinitely until an age-based retention period is decided.
