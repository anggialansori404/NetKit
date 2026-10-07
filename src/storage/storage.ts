/**
 * NetKit Local Storage & In-Memory Store
 * Sesuai DESIGN.md §3, §7
 * Storage lokal: 100% offline-first.
 * Kredensial SSH/SFTP di Keychain/Keystore abstraction.
 */

import { isPrivateIp } from '../engine/network.js';

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
  timestamp: string; // "10:38:02"
  ringkasan: string;
  output: string;
}

// Initial seed data dari mockups & DESIGN.md
const SEED_CLIENTS: Client[] = [
  {
    id: 'c1',
    namaBpr: 'BPR Artha Prima',
    alamat: 'Jl. Merdeka No. 88, Bandung',
    ipGateway: '192.168.10.5',
    port: 8080,
    ipVpn: '10.254.1.20',
    catatan: 'PIC: Pak Dedi 0812-3456-7890 (IBS Core v4.2)',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'c2',
    namaBpr: 'BPR Mitra Usaha',
    alamat: 'Jl. Ahmad Yani No. 12, Surabaya',
    ipGateway: '103.147.8.20',
    port: 9090,
    ipVpn: '10.254.2.15',
    catatan: 'Gateway IBS Branchless & QRIS USSI',
    createdAt: '2026-10-02T09:30:00Z',
    updatedAt: '2026-10-02T09:30:00Z',
  },
  {
    id: 'c3',
    namaBpr: 'Koperasi Sejahtera',
    alamat: 'Jl. Pahlawan No. 5, Semarang',
    ipGateway: '172.16.0.12',
    port: 8080,
    ipVpn: '10.254.3.50',
    catatan: 'Server lokal di ruang arsip lt. 2',
    createdAt: '2026-10-03T11:15:00Z',
    updatedAt: '2026-10-03T11:15:00Z',
  },
];

const SEED_SESSIONS: SshSession[] = [
  {
    id: 's1',
    nama: 'gw-bpr',
    host: '103.147.8.20',
    port: 22,
    username: 'root',
    auth: 'password',
    secretRef: 'sec_gw_bpr',
  },
  {
    id: 's2',
    nama: 'ibs-va-core',
    host: '103.147.8.22',
    port: 2222,
    username: 'admin',
    auth: 'key',
    secretRef: 'sec_ibs_core',
  },
];

const SEED_TOOL_RUNS: ToolRun[] = [
  {
    id: 't1',
    tool: 'PING',
    target: '8.8.8.8',
    timestamp: '10:38:02',
    ringkasan: '8.8.8.8  avg 14ms',
    output:
      'PING 8.8.8.8: 56 data bytes (mode: TCP ping)\n64B from 8.8.8.8: seq=0 ttl=117 time=12.4ms\n64B from 8.8.8.8: seq=1 ttl=117 time=14.1ms\n--- 8.8.8.8 ping statistics ---\n3 sent, 3 received, 0% loss, avg 14ms',
  },
  {
    id: 't2',
    tool: 'TELNET',
    target: '103.147.8.20:9090',
    timestamp: '10:31:47',
    ringkasan: '103.147.8.20:9090  OPEN 61ms',
    output:
      'Connecting to 103.147.8.20:9090...\nConnected to 103.147.8.20.\nOPEN (61 ms)\nBanner: SSH-2.0-OpenSSH_8.9',
  },
  {
    id: 't3',
    tool: 'DNS',
    target: 'gw-bpr.ussi.id',
    timestamp: '09:58:13',
    ringkasan: 'gw-bpr.ussi.id -> 103.147.8.20',
    output:
      'Resolving gw-bpr.ussi.id...\nStatus: NOERROR\nAnswers:\n  -> 103.147.8.20',
  },
];

class MemoryStore {
  private clients: Client[] = [...SEED_CLIENTS];
  private sessions: SshSession[] = [...SEED_SESSIONS];
  private toolRuns: ToolRun[] = [...SEED_TOOL_RUNS];
  private secrets: Map<string, string> = new Map([
    ['sec_gw_bpr', 'secret-pass-mock'],
  ]);

  // Clients
  getClients(): Client[] {
    return [...this.clients];
  }

  getClientById(id: string): Client | undefined {
    return this.clients.find((c) => c.id === id);
  }

  saveClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Client {
    const now = new Date().toISOString();
    if (client.id) {
      const idx = this.clients.findIndex((c) => c.id === client.id);
      if (idx >= 0) {
        const updated: Client = {
          ...this.clients[idx],
          ...client,
          id: client.id,
          updatedAt: now,
        };
        this.clients[idx] = updated;
        return updated;
      }
    }
    const newClient: Client = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      ...client,
      createdAt: now,
      updatedAt: now,
    };
    this.clients.unshift(newClient);
    return newClient;
  }

  deleteClient(id: string): boolean {
    const prev = this.clients.length;
    this.clients = this.clients.filter((c) => c.id !== id);
    return this.clients.length < prev;
  }

  getClientStats(): { total: number; lokal: number; publik: number } {
    let lokal = 0;
    let publik = 0;
    for (const c of this.clients) {
      if (isPrivateIp(c.ipGateway)) {
        lokal++;
      } else {
        publik++;
      }
    }
    return { total: this.clients.length, lokal, publik };
  }

  // SshSessions
  getSessions(): SshSession[] {
    return [...this.sessions];
  }

  addSession(session: Omit<SshSession, 'id'>, secretValue?: string): SshSession {
    const id = 's_' + Math.random().toString(36).substring(2, 9);
    const secretRef = 'sec_' + id;
    if (secretValue) {
      this.secrets.set(secretRef, secretValue);
    }
    const newSession: SshSession = {
      id,
      ...session,
      secretRef,
    };
    this.sessions.unshift(newSession);
    return newSession;
  }

  deleteSession(id: string): void {
    const s = this.sessions.find((item) => item.id === id);
    if (s) {
      this.secrets.delete(s.secretRef);
    }
    this.sessions = this.sessions.filter((item) => item.id !== id);
  }

  // Tool runs
  getToolRuns(): ToolRun[] {
    return [...this.toolRuns];
  }

  addToolRun(run: Omit<ToolRun, 'id'>): ToolRun {
    const newRun: ToolRun = {
      id: 't_' + Math.random().toString(36).substring(2, 9),
      ...run,
    };
    this.toolRuns.unshift(newRun);
    if (this.toolRuns.length > 20) {
      this.toolRuns = this.toolRuns.slice(0, 20);
    }
    return newRun;
  }

  // Reset / Hapus semua data
  resetAll(): void {
    this.clients = [];
    this.sessions = [];
    this.toolRuns = [];
    this.secrets.clear();
  }
}

export const store = new MemoryStore();
