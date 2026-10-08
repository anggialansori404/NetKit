<!-- Parent: ../../AGENTS.md -->
# Network Engine Subtree

Core networking algorithms, validation utilities, share formatters, and engine unit test suites.

## Architecture
- Pure TypeScript domain engine decoupled from React Native UI and native modules.
- Executable in standalone Node runtime (`node --experimental-strip-types`) without Metro or React Native bundling.
- Diagnostic runners (`runPing`, `runTelnet`, `runDns`, `runHttpSsl`) return typed diagnostic outputs and summaries.

## Key Files & Entry Points
- `src/engine/network.ts`: Core networking implementation:
  - `isPrivateIp(ip: string): boolean`: RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) and loopback/link-local validation.
  - `isValidIpv4(ip: string): boolean`: Strict 4-octet numeric IPv4 validation.
  - `isValidPort(port: number | string): boolean`: Validates port range 1 - 65535.
  - `formatSharePing`, `formatShareTelnet`, `formatShareDns`, `formatShareHttpSsl`: Format diagnostic reports for WhatsApp/Telegram per DESIGN.md §8.
  - `runPing(host, count)`: Ping execution using ICMP stub or latency simulation.
  - `runTelnet(host, port, timeout)`: TCP port connection check.
  - `runDns(domain)`: DNS resolution via Google DNS-over-HTTPS fallback.
  - `runHttpSsl(url)`: HTTP status code and SSL certificate check.
- `src/engine/__tests__/network.test.ts`: Unit tests validating IP validation and share format templates.
- `src/engine/__tests__/storage.test.ts`: Unit tests validating storage operations.

## Local Invariants & Rules
- Pure Functions: Network logic must remain UI-agnostic and exportable without React Native runtime dependencies.
- Share Output Invariant: WhatsApp/Telegram output formats must strictly follow `DESIGN.md §8` layout; verified by `network.test.ts`.
- DNS Fallback: In absence of native DNS bindings, `runDns` resolves via Google DNS-over-HTTPS (`https://dns.google/resolve?name=...`).
- Test Execution: Test suite runs directly via `npm test` (`node --experimental-strip-types --test src/engine/__tests__/*.test.ts`).

## Anti-Patterns & Forbidden Patterns
- NEVER import React, React Native, or Paper components inside `network.ts`.
- NEVER modify share template strings without updating corresponding test assertions in `network.test.ts`.
- NEVER omit RFC 1918 private IP tagging when handling network entities.

## Dependencies
- Internal: `src/storage/storage.ts` (consumed only by `__tests__/storage.test.ts`)
- External: Node.js standard libraries (`node:test`, `node:assert`)

## Cross-References
<!-- Parent: ../../AGENTS.md -->
<!-- Siblings: ../screens/AGENTS.md, ../storage/AGENTS.md, ../ui/AGENTS.md -->
