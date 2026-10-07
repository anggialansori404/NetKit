import assert from 'node:assert/strict';
import test from 'node:test';
import { store } from '../../storage/storage.ts';

test('store CRUD clients and stats', () => {
  const initialCount = store.getClients().length;
  assert.ok(initialCount >= 3);

  // Stats calculation
  const stats = store.getClientStats();
  assert.equal(stats.total, initialCount);
  assert.ok(stats.lokal >= 1);
  assert.ok(stats.publik >= 1);

  // Create new client
  const created = store.saveClient({
    namaBpr: 'BPR Test Verifikasi',
    alamat: 'Jl. Uji Coba No. 1',
    ipGateway: '192.168.1.100',
    port: 8080,
    ipVpn: '10.254.99.1',
    catatan: 'Catatan uji verifikasi otomatis',
  });
  assert.ok(created.id);
  assert.equal(created.namaBpr, 'BPR Test Verifikasi');
  assert.equal(store.getClients().length, initialCount + 1);

  // Read client
  const found = store.getClientById(created.id);
  assert.ok(found);
  assert.equal(found.namaBpr, 'BPR Test Verifikasi');

  // Update client
  store.saveClient({
    id: created.id,
    namaBpr: 'BPR Test Updated',
    alamat: 'Jl. Uji Coba No. 2',
    ipGateway: '103.147.8.99',
    port: 9090,
    ipVpn: '10.254.99.2',
  });
  const updated = store.getClientById(created.id);
  assert.ok(updated);
  assert.equal(updated.namaBpr, 'BPR Test Updated');
  assert.equal(updated.ipGateway, '103.147.8.99');

  // Delete client
  const deleted = store.deleteClient(created.id);
  assert.equal(deleted, true);
  assert.equal(store.getClientById(created.id), undefined);
});

test('store SSH sessions and ToolRuns', () => {
  const sess = store.addSession(
    {
      nama: 'test-gw',
      host: '10.0.0.1',
      port: 22,
      username: 'admin',
      auth: 'password',
      secretRef: '',
    },
    'mypassword'
  );
  assert.ok(sess.id);
  assert.equal(sess.nama, 'test-gw');
  assert.ok(sess.secretRef.startsWith('sec_'));

  const run = store.addToolRun({
    tool: 'PING',
    target: '1.1.1.1',
    timestamp: '12:00:00',
    ringkasan: '1.1.1.1 avg 10ms',
    output: 'PING 1.1.1.1 ok',
  });
  assert.ok(run.id);
  assert.equal(run.tool, 'PING');
});
