# ADR-031: Zig for Production Trading Bot

## Status

Accepted

## Context

The trading bot needs to run 24/7 on a minimal GCP e2-micro instance, processing real-time Binance WebSocket data and executing Alpaca paper trades. Key requirements: low latency, small binary, no runtime dependencies, cross-compilation to Linux from macOS.

## Decision

Use Zig 0.16 for the production trading bot. Single static binary, no Python/curl runtime dependencies (except `feed.zig` bootstrap and `telegram.zig` shutdown fallback which still use `popen("curl")`).

## Rationale

- **Single static binary.** `zig build -Doptimize=ReleaseFast` produces one ~4MB binary. No interpreter, no virtual environment, no package manager on the server.
- **Cross-compilation.** `-Dtarget=x86_64-linux` builds a Linux binary on macOS arm64 in seconds. No Docker, no CI pipeline needed for deployment.
- **Native WebSocket + TLS.** `websocket.zig` library provides native TLS WebSocket connections. No external dependencies for Binance streaming.
- **Deterministic memory.** No GC pauses during price processing. Arena allocators for request/response cycles, fixed-size ring buffers for MA and volatility windows.
- **Async fire-and-forget.** `std.Thread.spawn` + `detach()` for Turso writes and Telegram notifications. Trading loop never blocks on I/O.

## Consequences

- Steeper learning curve than Python, but the bot is write-once-run-forever.
- `popen("curl")` remains in two places: `feed.zig` REST bootstrap (separate refactor) and `telegram.zig` shutdown (native HTTP may have stale connections).
- No REPL or hot-reload — changes require rebuild. Acceptable for a production bot that rarely changes.

## Alternatives Considered

- **Python** — prototyped first in the research lab. Too slow for real-time tick processing, GC pauses, heavy runtime.
- **Rust** — similar performance profile but longer compile times, more complex ownership model for the fire-and-forget async pattern.
- **Go** — GC pauses unacceptable for latency-sensitive trading. Larger binaries.
