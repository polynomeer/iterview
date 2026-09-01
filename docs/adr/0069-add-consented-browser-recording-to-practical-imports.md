# 0069. Add Consented Browser Recording To Practical Imports

## Status
Accepted

## Date
2026-09-01

## Context

Practical interview review accepted recorded audio files, but users had to leave the product to
create an audio artifact before beginning a review. This adds friction to the core practice and
recovery loop. Microphone access also requires an explicit and understandable user decision.

## Decision

Provide browser-side microphone capture in the practical interview import form as an alternative
to selecting an existing file. Recording remains disabled until the user consents to creating the
recording on the device and uploading it when they create the record. The captured WebM file uses
the existing multipart upload contract, so it follows the same authorization, size validation,
storage, and protected playback path as uploaded audio.

## Consequences

Positive:

- A user can start a practice artifact without a separate recording tool.
- Existing upload and server-side transcription behavior remain the single ingestion path.
- Consent and microphone permission failures are visible before record creation.

Trade-offs:

- Capture depends on browser `MediaRecorder` support and microphone permissions.
- A recorded file remains in memory until the user creates the record or leaves the page.
