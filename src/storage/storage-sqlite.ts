/**
 * NetKit SQLite Storage
 * Persistent local storage using op-sqlite.
 * Replaces in-memory store — data survives app restarts.
 * NO dummy/seed data.
 */

import { open, type DB } from '@op-engineering/op-sqlite';
import { isPrivateIp } from '../engine/network';

export interface Client {
  id: string;
  namaBpr: string;
  alamat: string;
  ipGateway: string;
  port: number;
  ipVpn: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SshSession {
  id: string;
  nama: string;
  host: string;
  port: number;
  username: string;
  auth: 'password' | 'key';
  secretRef: string;
}

export interface ToolRun {
  id: string;
  tool: 'PING' | 'TELNET' | 'DNS' | 'HTTP/SSL';
  target: string;
  timestamp: string;
  ringkasan: string;
  output: string;
}

let db: DB | null = null;

function getDb(): DB {
  if (!db) {
    db = open({ name: 'netkit.db' });
    initTables(db);
  }
  return db;
}

function initTables(database: DB) {
  database.executeSync(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      namaBpr TEXT NOT NULL,
      alamat TEXT,
      ipGateway TEXT NOT NULL,
      port INTEGER DEFAULT 22,
      ipVpn TEXT,
      catatan TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);
  database.executeSync(`
    CREATE TABLE IF NOT EXISTS ssh_sessions (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      host TEXT NOT NULL,
      port INTEGER DEFAULT 22,
      username TEXT,
      auth TEXT,
      secretRef TEXT
    );
  `);
  database.executeSync(`
    CREATE TABLE IF NOT EXISTS tool_runs (
      id TEXT PRIMARY KEY,
      tool TEXT NOT NULL,
      target TEXT,
      timestamp TEXT,
      ringkasan TEXT,
      output TEXT
    );
  `);
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Clients ──

export function getClients(): Client[] {
  const database = getDb();
  const rows = database.executeSync(`SELECT * FROM clients ORDER BY namaBpr ASC`);
  return (rows.rows || []) as unknown as Client[]
}

export function getClientById(id: string): Client | undefined {
  const database = getDb();
  const rows = database.executeSync(`SELECT * FROM clients WHERE id = ?`, [id]);
  const arr = (rows.rows || []) as unknown as Client[];
  return arr[0];
}

export function saveClient(
  client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Client {
  const database = getDb();
  const now = new Date().toISOString();
  if (client.id) {
    const existing = getClientById(client.id);
    database.executeSync(
      `UPDATE clients SET namaBpr=?, alamat=?, ipGateway=?, port=?, ipVpn=?, catatan=?, updatedAt=? WHERE id=?`,
      [client.namaBpr, client.alamat, client.ipGateway, client.port, client.ipVpn, client.catatan || '', now, client.id]
    );
    return { ...existing!, ...client, id: client.id, updatedAt: now };
  } else {
    const id = genId('c');
    database.executeSync(
      `INSERT INTO clients (id, namaBpr, alamat, ipGateway, port, ipVpn, catatan, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, client.namaBpr, client.alamat, client.ipGateway, client.port, client.ipVpn, client.catatan || '', now, now]
    );
    return { ...client, id, createdAt: now, updatedAt: now };
  }
}

export function deleteClient(id: string): boolean {
  const database = getDb();
  const res = database.executeSync(`DELETE FROM clients WHERE id = ?`, [id]);
  return (res.rowsAffected || 0) > 0;
}

export function getClientStats(): { total: number; lokal: number; publik: number } {
  const clients = getClients();
  let lokal = 0;
  for (const c of clients) {
    if (isPrivateIp(c.ipGateway)) lokal++;
  }
  return { total: clients.length, lokal, publik: clients.length - lokal };
}

// ── SSH Sessions ──

export function getSessions(): SshSession[] {
  const database = getDb();
  const rows = database.executeSync(`SELECT * FROM ssh_sessions ORDER BY nama ASC`);
  return (rows.rows || []) as unknown as SshSession[];
}

export function addSession(session: Omit<SshSession, 'id'>): SshSession {
  const database = getDb();
  const id = genId('s');
  database.executeSync(
    `INSERT INTO ssh_sessions (id, nama, host, port, username, auth, secretRef) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, session.nama, session.host, session.port, session.username, session.auth, session.secretRef]
  );
  return { ...session, id };
}

export function deleteSession(id: string): void {
  const database = getDb();
  database.executeSync(`DELETE FROM ssh_sessions WHERE id = ?`, [id]);
}

// ── Tool Runs ──

export function getToolRuns(): ToolRun[] {
  const database = getDb();
  const rows = database.executeSync(`SELECT * FROM tool_runs ORDER BY timestamp DESC LIMIT 50`);
  return (rows.rows || []) as unknown as ToolRun[];
}

export function addToolRun(run: Omit<ToolRun, 'id'>): ToolRun {
  const database = getDb();
  const id = genId('t');
  database.executeSync(
    `INSERT INTO tool_runs (id, tool, target, timestamp, ringkasan, output) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, run.tool, run.target, run.timestamp, run.ringkasan, run.output]
  );
  return { ...run, id };
}

// Legacy: store object for backward compat (deprecated, use functions directly)
export const store = {
  getClients,
  getClientById,
  saveClient,
  deleteClient,
  getClientStats,
  getSessions,
  addSession,
  deleteSession,
  getToolRuns,
  addToolRun,
  resetAll: () => {
    const database = getDb();
    database.executeSync(`DELETE FROM clients`);
    database.executeSync(`DELETE FROM ssh_sessions`);
    database.executeSync(`DELETE FROM tool_runs`);
  },
};
