# 0062. Protect Interview Recording Access

## Status
Accepted

## Date
2026-09-01

## Context

Practical interview recordings contain a user's voice, interviewer questions, and detailed
career context. They were stored beneath a publicly mapped static directory and their direct
file URLs were returned in record and playback payloads. A guessed or retained URL could
therefore bypass the ownership checks applied to the rest of the interview-record API.

Browser media elements cannot attach the application's bearer token to a direct `src` request,
so protecting the file path alone would break authenticated replay.

## Decision

Remove the public static resource mapping for interview audio. Serve each recording from an
authenticated `/api/interview-records/{recordId}/audio` endpoint that resolves the current user
and record ownership before opening the stored file. Keep the existing stored URL column as an
internal storage reference for backward compatibility, but expose only the protected endpoint in
record and playback DTOs.

The web client fetches that endpoint through the authenticated HTTP client, creates a temporary
object URL for the audio element, and revokes it when the recording changes or the page unmounts.
Responses are marked `no-store` to avoid caching recording content in shared HTTP caches.

## Consequences

Positive:

- Recording playback follows the same ownership boundary as transcripts and review data.
- Existing stored recordings remain readable without a database migration.
- The browser never receives an unauthenticated storage URL for sensitive audio.

Trade-offs:

- Replay downloads the selected recording into a browser Blob before playback rather than using
  native streaming directly from a static URL.
- Very large recordings may later require authenticated byte-range support or short-lived signed
  URLs; those options must preserve ownership and expiry guarantees.
