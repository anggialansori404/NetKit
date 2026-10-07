import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isPrivateIp,
  isValidIpv4,
  isValidPort,
  formatSharePing,
  formatShareTelnet,
} from '../network.ts';

test('isPrivateIp identifies RFC 1918 and loopback/link-local', () => {
  // 10.0.0.0/8
  assert.equal(isPrivateIp('10.0.0.1'), true);
  assert.equal(isPrivateIp('10.254.1.20'), true);

  // 172.16.0.0/12
  assert.equal(isPrivateIp('172.16.0.1'), true);
  assert.equal(isPrivateIp('172.31.255.255'), true);
  assert.equal(isPrivateIp('172.15.0.1'), false);
  assert.equal(isPrivateIp('172.32.0.1'), false);

  // 192.168.0.0/16
  assert.equal(isPrivateIp('192.168.1.1'), true);
  assert.equal(isPrivateIp('192.168.10.5'), true);

  // 169.254.0.0/16
  assert.equal(isPrivateIp('169.254.1.1'), true);

  // Public IPs
  assert.equal(isPrivateIp('8.8.8.8'), false);
  assert.equal(isPrivateIp('1.1.1.1'), false);
  assert.equal(isPrivateIp('103.147.8.20'), false);
  assert.equal(isPrivateIp(''), false);
});

test('isValidIpv4 validates correctly', () => {
  assert.equal(isValidIpv4('192.168.1.1'), true);
  assert.equal(isValidIpv4('10.0.0.1'), true);
  assert.equal(isValidIpv4('103.147.8.20'), true);
  assert.equal(isValidIpv4('999.1.1.1'), false);
  assert.equal(isValidIpv4('192.168.1'), false);
  assert.equal(isValidIpv4('192.168.1.1.1'), false);
  assert.equal(isValidIpv4('abc.def.ghi.jkl'), false);
  assert.equal(isValidIpv4('192.168.01.1'), false); // leading zero rejected
});

test('isValidPort validates 1-65535', () => {
  assert.equal(isValidPort(80), true);
  assert.equal(isValidPort('8080'), true);
  assert.equal(isValidPort(65535), true);
  assert.equal(isValidPort(1), true);
  assert.equal(isValidPort(0), false);
  assert.equal(isValidPort(65536), false);
  assert.equal(isValidPort(-1), false);
  assert.equal(isValidPort('abc'), false);
});

test('formatSharePing matches DESIGN.md §8', () => {
  const text = formatSharePing('8.8.8.8', {
    sent: 3,
    received: 3,
    loss: 0,
    avgMs: 12.4,
    mode: 'TCP ping',
  });
  assert.match(text, /\[NetKit\] Ping 8\.8\.8\.8/);
  assert.match(text, /3 sent, 3 received, 0% loss, avg 12\.4ms \(TCP ping\)/);
});

test('formatShareTelnet matches DESIGN.md §8', () => {
  const text = formatShareTelnet('103.147.8.20', 9090, {
    status: 'OPEN',
    latencyMs: 61,
    banner: 'SSH-2.0-OpenSSH_8.9',
  });
  assert.match(text, /\[NetKit\] Telnet 103\.147\.8\.20:9090/);
  assert.match(text, /OPEN \(61 ms\)/);
  assert.match(text, /Banner: SSH-2\.0-OpenSSH_8\.9/);
});
