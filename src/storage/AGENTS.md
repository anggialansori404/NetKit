<!-- Parent: ../../AGENTS.md -->
# Storage Subtree

Persistent SQLite database and in-memory mock storage layer for NetKit.

## Architecture
- Active Persistence (`storage-sqlite.ts`): JSI-powered SQLite layer using `@op-engineering/op-sqlite` (`netkit.db`).
- In-Memory Fallback (`storage.ts`): Pure JavaScript `MemoryStore` initialized with sample BPR clients for tests and dev fallbacks.

## Key Files & Entry Points
- `src/storage/storage-sqlite.ts`: Active SQLite storage implementation:
  - Tables: `clients` (id, name, ipGateway, port, notes, isPrivate), `ssh_sessions`, `tool_runs`.
  - Exported functions:
    - `getClients(): Promise<Client[]>`: Retrieve all client records.
    - `getClientById(id: string): Promise<Client | null>`: Retrieve single client.
    - `saveClient(client: Client): Promise<void>`: Insert or update client record.
    - `deleteClient(id: string): Promise<void>`: Permanently remove client.
    - `getClientStats(): Promise<{ total: number; private: number; public: number }>`: Client counts.
    - `getSessions()`, `addSession()`, `deleteSession()`: SSH/SFTP session CRUD.
    - `getToolRuns()`, `addToolRun()`: Diagnostic execution history CRUD.
  - Exported singleton: `store` (backward-compatibility wrapper).
- `src/storage/storage.ts`: Legacy in-memory mock store and data interfaces (`Client`, `SshSession`, `ToolRun`).

## Local Invariants & Rules
- Storage Target: All active screens and features MUST use `src/storage/storage-sqlite.ts`.
- Database Auto-Init: SQLite tables are created automatically on database connection opening.
- Client Deletion: Deleting a client must permanently remove the record from SQLite (`DELETE FROM clients WHERE id = ?`).
- IP Privacy Tagging: Client records automatically tag `isPrivate` status via `isPrivateIp` from `src/engine/network.ts`.

## Anti-Patterns & Forbidden Patterns
- NEVER import `src/storage/storage.ts` in active screens (`*MD3.tsx`).
- NEVER leave client deletions as soft deletes when persistent removal is required.
- NEVER perform raw SQL queries directly in UI components; add typed helper functions in `storage-sqlite.ts`.

## Dependencies
- Internal: `src/engine/network.ts` (`isPrivateIp`)
- External: `@op-engineering/op-sqlite`

## Cross-References
<!-- Parent: ../../AGENTS.md -->
<!-- Siblings: ../screens/AGENTS.md, ../engine/AGENTS.md, ../ui/AGENTS.md -->
