# ADR-035: Native Zig HTTP Client

## Status

Accepted

## Context

The bot originally used `popen("curl ...")` for all HTTP calls (Turso, Alpaca, Telegram, ntfy). This worked but had problems: spawning a process per request, no connection pooling, string-based URL/header construction prone to injection, and a hard dependency on curl being installed.

## Decision

Replace `popen("curl")` with a shared `HttpClient` wrapper around `std.http.Client`. All modules (turso, alpaca, telegram) use the same client instance, passed from `main.zig`.

Two exceptions remain:
- `feed.zig` bootstrap: uses `popen("curl")` for Binance REST kline fetch (separate refactor).
- `telegram.zig` shutdown: uses curl fallback because native HTTP connections may be stale after hours of idle.

## Rationale

- **Connection pooling.** Single `std.http.Client` reuses TCP connections across modules.
- **No process spawning.** HTTP calls are in-process, ~10x faster than fork+exec curl.
- **Type safety.** Headers and URLs are constructed programmatically, not via string interpolation.
- **Zero external deps.** No curl binary required on the target system.

## Consequences

- `http_client.zig` provides `post()`, `get()`, `delete()` with custom headers.
- All async Turso/Telegram writes allocate a context struct on the heap, freed in the worker thread after the HTTP call completes.
- Sync reads (startup queries) use blocking HTTP calls on the main thread.
- 10 new tests for JSON parsing (Alpaca + Turso response handling).

## Alternatives Considered

- **Keep popen("curl")** — works but wasteful and fragile.
- **libcurl bindings** — adds a C dependency, defeats the purpose of a static Zig binary.
- **Async I/O (io_uring)** — overkill for a bot that makes ~10 HTTP calls per trade.
