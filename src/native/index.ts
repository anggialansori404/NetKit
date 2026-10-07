/**
 * NetKit Native Modules Interface Specification
 * Sesuai DESIGN.md §3, §5, §7
 * Interface native untuk ICMP ping, DNS lookup, dan SSL peer cert handshake.
 */

export interface NativeDnsResult {
  ok: boolean;
  hostname: string;
  ips: string[];
  latencyMs: number;
  error?: string;
}

export interface NativeSslCertResult {
  ok: boolean;
  valid: boolean;
  issuer: string;
  subject: string;
  expiresAt: string;
  daysLeft: number;
  error?: string;
}

export interface NativeIcmpPingResult {
  ok: boolean;
  host: string;
  latencyMs: number;
  ttl?: number;
  error?: string;
}

export interface NetKitNativeInterface {
  lookupDns(hostname: string): Promise<NativeDnsResult>;
  getSslCert(host: string, port?: number): Promise<NativeSslCertResult>;
  icmpPing(host: string, timeoutMs?: number): Promise<NativeIcmpPingResult>;
}

// Native Module Mock / Stub implementation untuk prototype UI
export const NetKitNative: NetKitNativeInterface = {
  // TODO stub: ganti dengan InetAddress.getAllByName (Android) / getaddrinfo (iOS)
  async lookupDns(hostname: string): Promise<NativeDnsResult> {
    const t0 = Date.now();
    await new Promise((r) => setTimeout(r, 150));
    const latencyMs = Date.now() - t0;

    if (hostname.toLowerCase() === 'google.com' || hostname.toLowerCase() === 'dns.google') {
      return {
        ok: true,
        hostname,
        ips: ['8.8.8.8', '8.8.4.4'],
        latencyMs,
      };
    }
    if (hostname.includes('ussi') || hostname.includes('bpr')) {
      return {
        ok: true,
        hostname,
        ips: ['103.147.8.20', '103.147.8.22'],
        latencyMs,
      };
    }
    return {
      ok: true,
      hostname,
      ips: ['103.147.8.20'],
      latencyMs,
    };
  },

  // TODO stub: ganti dengan SSLSocket.getSession().getPeerCertificates() (Android) / SecTrust (iOS)
  async getSslCert(host: string, port = 443): Promise<NativeSslCertResult> {
    await new Promise((r) => setTimeout(r, 200));
    const isUssi = host.includes('ussi') || host.includes('bpr') || host === '103.147.8.20';
    return {
      ok: true,
      valid: true,
      issuer: isUssi ? "Let's Encrypt Authority X3" : 'DigiCert Global Root G2',
      subject: `CN=${host}`,
      expiresAt: '2027-04-15T00:00:00Z',
      daysLeft: 189,
    };
  },

  // TODO stub: ganti dengan ICMP native ping (Android isReachable / iOS SimplePing)
  async icmpPing(host: string, timeoutMs = 2000): Promise<NativeIcmpPingResult> {
    await new Promise((r) => setTimeout(r, 50));
    return {
      ok: true,
      host,
      latencyMs: 14,
      ttl: 117,
    };
  },
};
