/**
 * NetKit MD3 - SSH Terminal Screen
 * Full pty terminal: xterm.js in WebView + SSH shell channel.
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
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
<link rel="stylesheet" href="file:///android_asset/xterm.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css">
</head>
<body>
<div id="terminal"></div>
<script src="file:///android_asset/xterm.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>
<script>
  function notifyError(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', data: msg }));
    }
  }

  function initTerminal() {
    try {
      window.term = new Terminal({
        theme: { background: '#1D1B20', foreground: '#E6E0E9' },
        fontSize: 14,
        fontFamily: '"JetBrains Mono", "DejaVu Sans Mono", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 1000,
        // Termux-like: allow proper line wrapping
        allowProposedApi: true,
      });
      // Fit addon — sesuaikan ukuran terminal dengan layar (kayak Termux)
      window.fitAddon = new FitAddon.FitAddon();
      window.term.loadAddon(window.fitAddon);
      window.term.open(document.getElementById('terminal'));
      window.fitAddon.fit();
      // Re-fit saat orientasi berubah
      window.addEventListener('resize', function() {
        try { window.fitAddon.fit(); } catch(e) {}
      });
      window.term.writeln('NetKit SSH Terminal');
      window.term.writeln('Menghubungkan...\\r\\n');

      window.term.onData(function(data) {
        // Local echo dengan handling khusus untuk backspace/delete
        if (data === '\x7f' || data === '\b') {
          // Backspace: mundur, hapus char, mundur lagi
          window.term.write('\b \b');
        } else if (data === '\r') {
          // Enter: pindah baris
          window.term.write('\r\n');
        } else if (data.charCodeAt(0) < 32 && data !== '\t') {
          // Skip control chars lain (kecuali tab)
        } else {
          window.term.write(data);
        }
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'input', data: data }));
        }
      });

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
      }
    } catch (err) {
      notifyError('Init terminal error: ' + err.message);
    }
  }

  // Fallback ke CDN jika local asset belum ada atau gagal
  if (typeof Terminal === 'undefined') {
    var cdnScript = document.createElement('script');
    cdnScript.src = 'https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js';
    cdnScript.onload = initTerminal;
    cdnScript.onerror = function() {
      notifyError('Gagal memuat xterm.js baik dari local asset maupun CDN');
    };
    document.head.appendChild(cdnScript);
  } else {
    initTerminal();
  }

  // Terima data dari React Native (dukung Android document dan iOS window)
  function handleRNMessage(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'data' && window.term) window.term.write(msg.data);
      if (msg.type === 'clear' && window.term) window.term.clear();
    } catch(err) {}
  }
  window.addEventListener('message', handleRNMessage);
  document.addEventListener('message', handleRNMessage);
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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);
  const sshClientRef = useRef<any>(null);

  // Tambah log ke debug panel native (selalu terlihat, tidak bergantung WebView)
  const addDebugLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString('id-ID', { hour12: false });
    setDebugLogs((prev) => [...prev.slice(-49), `[${ts}] ${msg}`]);
  };

  // Fallback: jika WebView tidak kirim 'ready' dalam 3 detik, tampilkan dialog password anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!terminalReady) {
        addDebugLog('[WARN] WebView xterm.js timeout (3s), membuka dialog password');
        connectSsh();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [terminalReady]);

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
    // Kirim ke WebView (jika siap)
    try {
      webviewRef.current?.postMessage(JSON.stringify({ type: 'data', data }));
    } catch (e) {}
    // SELALU catat ke debug log native (fallback jika WebView gagal)
    const clean = data.replace(/\x1b\[[0-9;]*m/g, '').trim();
    if (clean) {
      addDebugLog(clean);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready') {
        setTerminalReady(true);
        addDebugLog('Terminal xterm.js siap');
        connectSsh();
      } else if (msg.type === 'input') {
        if (sshClientRef.current && connected) {
          sshClientRef.current.writeToShell(msg.data).catch(() => {});
        }
      } else if (msg.type === 'error') {
        addDebugLog(`[WebView Error] ${msg.data}`);
        setShowDebug(true);
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
    const nativeMsg = `Native module RNSSHClient: ${RNSSHClient ? 'ADA' : 'TIDAK ADA'}`;
    addDebugLog(nativeMsg);
    sendToTerminal(`[DEBUG] ${nativeMsg}\r\n`);
    if (!RNSSHClient) {
      const err = 'RNSSHClient tidak ditemukan! Library belum ke-link di build ini.';
      addDebugLog(`ERROR: ${err}`);
      sendToTerminal(`\x1b[31m[DEBUG] ${err}\x1b[0m\r\n`);
      setStatus('Gagal: native module tidak ada');
      Alert.alert('Error SSH', err);
      return;
    }

    const connMsg = `Connect ke ${session.host}:${session.port} sebagai ${session.username}`;
    addDebugLog(connMsg);
    sendToTerminal(`[DEBUG] ${connMsg}...\r\n`);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout 15 detik: server tidak merespons')), 15000)
    );

    try {
      addDebugLog('Memanggil connectWithPassword...');
      sendToTerminal('[DEBUG] Memanggil connectWithPassword...\r\n');
      const connectPromise = SSHClient.connectWithPassword(
        session.host,
        session.port,
        session.username,
        pwd
      );
      addDebugLog('Promise dibuat, menunggu (timeout 15s)...');
      sendToTerminal('[DEBUG] Promise dibuat, menunggu...\r\n');
      const client: any = await Promise.race([connectPromise, timeoutPromise]);
      addDebugLog('Terhubung! Membuka shell...');
      sendToTerminal('[DEBUG] Terhubung! Membuka shell...\r\n');
      sshClientRef.current = client;

      await client.startShell(PtyType.XTERM);
      addDebugLog('Shell dibuka, menunggu output...');
      sendToTerminal('[DEBUG] Shell dibuka.\r\n');

      client.on('Shell', (event: any) => {
        // Native kirim {name, key, value} — ambil value-nya saja
        const output = typeof event === 'string' ? event : event?.value;
        if (output) {
          addDebugLog(`[SHELL] ${output.substring(0, 100)}`);
          sendToTerminal(output);
        }
      });

      setConnected(true);
      setStatus('Terhubung');
      sendToTerminal('\r\n\x1b[32mTerhubung!\x1b[0m\r\n');
    } catch (e: any) {
      const msg = e.message || String(e);
      addDebugLog(`ERROR: ${msg}`);
      sendToTerminal(`\r\n\x1b[31m[DEBUG] Error: ${msg}\x1b[0m\r\n`);
      setStatus(`Gagal: ${msg}`);
      Alert.alert(
        'Gagal Terhubung',
        `Error: ${msg}`,
        [
          { text: 'Coba Lagi', onPress: () => setShowPasswordDialog(true) },
          { text: 'Batal', style: 'cancel' },
        ]
      );
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
        <Appbar.Action
          icon="bug-outline"
          onPress={() => setShowDebug(!showDebug)}
        />
      </Appbar.Header>

      {/* Debug panel native — selalu terlihat, tidak bergantung WebView */}
      {showDebug && (
        <View style={[styles.debugPanel, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.debugHeader}>
            <Text variant="labelLarge">Debug Log</Text>
            <Button compact onPress={() => setDebugLogs([])}>Clear</Button>
          </View>
          <ScrollView style={styles.debugScroll}>
            {debugLogs.length === 0 ? (
              <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                Belum ada log. Coba hubungkan untuk melihat debug output.
              </Text>
            ) : (
              debugLogs.map((log, i) => (
                <Text key={i} variant="bodySmall" style={styles.debugText} selectable>
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      )}

      <WebView
        ref={webviewRef}
        source={{
          html: XTERM_HTML,
          baseUrl: Platform.OS === 'android' ? 'file:///android_asset/' : undefined,
        }}
        onMessage={handleMessage}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        onError={(e) => {
          addDebugLog(`[WebView Load Error] ${e.nativeEvent.description}`);
          setShowDebug(true);
        }}
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
  debugPanel: {
    maxHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  debugScroll: {
    maxHeight: 150,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 2,
  },
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
