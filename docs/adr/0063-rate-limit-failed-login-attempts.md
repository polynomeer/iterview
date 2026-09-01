# 0063. Rate Limit Failed Login Attempts Per Account

## Status
Accepted

## Date
2026-09-01

## Context

The public password-login endpoint had no attempt limit. This allowed repeated credential
guessing against a known account while leaving no consistent retry signal for the web client.

Using a client IP as the initial key would be unsafe because the application does not yet define
which reverse proxies are trusted. Trusting arbitrary forwarded headers would let a caller choose
their own limit key, while using a shared proxy address could throttle unrelated users.

## Decision

Apply an in-memory fixed-window limit to login attempts keyed by normalized email address. The
default is five attempts in fifteen minutes, configurable through `APP_RATE_LIMIT_LOGIN_*`.
Every login request consumes an attempt before credential evaluation; a successful login clears
that account's window. A blocked request returns `429 Too Many Requests`, a `Retry-After` header,
and the standard localized API error payload.

## Consequences

Positive:

- Password guessing against a single account is bounded without trusting proxy headers.
- Clients receive an explicit retry signal rather than ambiguous authentication failures.
- Successful users are not penalized by earlier mistyped passwords once they authenticate.

Trade-offs:

- The limiter is process-local and therefore does not coordinate across application instances or survive restarts.
- A party that knows an email address can temporarily consume its attempt budget; stronger distributed protection
  should combine an external store, carefully configured proxy trust, and operational monitoring.
