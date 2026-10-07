/**
 * NetKit MD3 - SSH Terminal Screen
 * Full pty terminal: xterm.js in WebView + SSH shell channel.
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Appbar,
  Text,
  IconButton,
  Portal,
  Dialog,
  TextInput,
  Button,
  useTheme,
} from 'react-native-paper';
import SSHClient, { PtyType } from '@dylankenneally/react-native-ssh-sftp';
import { NativeModules } from 'react-native';
import { store } from '../storage/storage-sqlite';

// xterm.js HTML — terminal emulator in WebView
const XTERM_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  html, body { margin: 0; padding: 0; background: #1D1B20; height: 100%; overflow: hidden; }
  #terminal { height: 100%; padding: 8px; }
  .xterm { height: 100%; }
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css">
</head>
<body>
<div id="terminal"></div>
<script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js"></script>
<script>
  const term = new Terminal({
    theme: { background: '#1D1B20', foreground: '#E6E0E9' },
    fontSize: 14,
    fontFamily: 'monospace',
    cursorBlink: true,
  });
  term.open(document.getElementById('terminal'));
  term.writeln('NetKit SSH Terminal');
  term.writeln('Menghubungkan...\\r\\n');

  // Terima data dari React Native
  window.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'data') term.write(msg.data);
      if (msg.type === 'clear') term.clear();
    } catch(err) {}
  });

  // Kirim input ke React Native
  term.onData((data) => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'input', data }));
  });

  // Beri tahu RN bahwa terminal siap
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
</script>
</body>
</html>
`;

export function SshTerminalScreenMD3({ navigation, route }: any) {
  const theme = useTheme();
  const { sessionId } = route.params;
  const session = store.getSessions().find((s) => s.id === sessionId);
  const webviewRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Menghubungkan...');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const sshClientRef = useRef<any>(null);

  // Fallback: jika WebView tidak kirim 'ready' dalam 3 detik, tampilkan dialog password anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!terminalReady) {
        console.log('[SSH] WebView timeout, tampilkan dialog password');
        connectSsh();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      try {
        sshClientRef.current?.closeShell();
        sshClientRef.current?.disconnect();
      } catch (e) {}
    };
  }, []);

  const sendToTerminal = (data: string) => {
    webviewRef.current?.postMessage(JSON.stringify({ type: 'data', data }));
  };

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready') {
        setTerminalReady(true);
        connectSsh();
      } else if (msg.type === 'input') {
        if (sshClientRef.current && connected) {
          sshClientRef.current.writeToShell(msg.data).catch(() => {});
        }
      }
    } catch (e) {}
  };

  const connectSsh = async () => {
    if (!session) {
      setStatus('Sesi tidak ditemukan');
      sendToTerminal('\r\n\x1b[31mSesi tidak ditemukan\x1b[0m\r\n');
      return;
    }

    // Minta password dulu
    setShowPasswordDialog(true);
    setStatus('Menunggu password...');
    sendToTerminal(`\r\nSesi: ${session.nama} (${session.username}@${session.host}:${session.port})\r\n`);
  };

  const doConnect = async (pwd: string) => {
    if (!session) return;
    if (!pwd.trim()) {
      sendToTerminal('\r\n\x1b[31mPassword tidak boleh kosong\x1b[0m\r\n');
      return;
    }
    setShowPasswordDialog(false);
    setStatus(`Menghubungkan ke ${session.host}...`);

    // DEBUG: cek native module
    const { RNSSHClient } = NativeModules;
    sendToTerminal(`[DEBUG] Native module: ${RNSSHClient ? 'ADA' : 'TIDAK ADA'}\r\n`);
    if (!RNSSHClient) {
      sendToTerminal('\x1b[31m[DEBUG] RNSSHClient tidak ditemukan! Library belum ke-link.\x1b[0m\r\n');
      setStatus('Gagal: native module tidak ada');
      return;
    }

    sendToTerminal(`[DEBUG] Connect ke ${session.host}:${session.port} sebagai ${session.username}...\r\n`);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout 15 detik: server tidak merespons')), 15000)
    );

    try {
      sendToTerminal('[DEBUG] Memanggil connectWithPassword...\r\n');
      const connectPromise = SSHClient.connectWithPassword(
        session.host,
        session.port,
        session.username,
        pwd
      );
      sendToTerminal('[DEBUG] Promise dibuat, menunggu...\r\n');
      const client: any = await Promise.race([connectPromise, timeoutPromise]);
      sendToTerminal('[DEBUG] Terhubung! Membuka shell...\r\n');
      sshClientRef.current = client;

      await client.startShell(PtyType.XTERM);
      sendToTerminal('[DEBUG] Shell dibuka.\r\n');

      client.on('Shell', (event: any) => {
        if (event) sendToTerminal(event);
      });

      setConnected(true);
      setStatus('Terhubung');
      sendToTerminal('\r\n\x1b[32mTerhubung!\x1b[0m\r\n');
    } catch (e: any) {
      const msg = e.message || String(e);
      sendToTerminal(`\r\n\x1b[31m[DEBUG] Error: ${msg}\x1b[0m\r\n`);
      setStatus(`Gagal: ${msg}`);
      setTimeout(() => setShowPasswordDialog(true), 1000);
    }
  };

  const sendKey = (key: string) => {
    // Kirim special key ke terminal
    const keys: Record<string, string> = {
      'Esc': '\x1b',
      'Tab': '\t',
      'Ctrl+C': '\x03',
      'Ctrl+D': '\x04',
      'Up': '\x1b[A',
      'Down': '\x1b[B',
      'Left': '\x1b[D',
      'Right': '\x1b[C',
    };
    sendToTerminal(keys[key] || key);
  };

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Sesi tidak ditemukan" />
        </Appbar.Header>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#1D1B20' }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={session.nama}
          subtitle={`${session.username}@${session.host}:${session.port} · ${status}`}
        />
      </Appbar.Header>

      <WebView
        ref={webviewRef}
        source={{ html: XTERM_HTML }}
        onMessage={handleMessage}
        style={styles.webview}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />

      {/* Extra key row: Esc, Tab, Ctrl, Arrows */}
      <View style={[styles.keyRow, { backgroundColor: theme.colors.surfaceVariant }]}>
        {['Esc', 'Tab', 'Ctrl+C', 'Ctrl+D', 'Up', 'Down', 'Left', 'Right'].map((k) => (
          <IconButton
            key={k}
            icon={
              k === 'Up' ? 'chevron-up' :
              k === 'Down' ? 'chevron-down' :
              k === 'Left' ? 'chevron-left' :
              k === 'Right' ? 'chevron-right' : 'keyboard'
            }
            size={20}
            onPress={() => sendKey(k)}
            style={styles.keyButton}
          />
        ))}
      </View>
      <View style={[styles.keyLabels, { backgroundColor: theme.colors.surfaceVariant }]}>
        {['Esc', 'Tab', 'C', 'D', '↑', '↓', '←', '→'].map((k, i) => (
          <Text key={i} variant="labelSmall" style={styles.keyLabel}>
            {k}
          </Text>
        ))}
      </View>

      {/* Password dialog */}
      <Portal>
        <Dialog visible={showPasswordDialog} onDismiss={() => navigation.goBack()}>
          <Dialog.Title>Password SSH</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              {session?.username}@{session?.host}:{session?.port}
            </Text>
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              mode="outlined"
              dense
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => doConnect(password)}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => navigation.goBack()}>Batal</Button>
            <Button onPress={() => doConnect(password)}>Hubungkan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#1D1B20' },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#CAC4D0',
  },
  keyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  keyLabel: { fontSize: 10, opacity: 0.7, width: 40, textAlign: 'center' },
  keyButton: { margin: 0, width: 40 },
});
