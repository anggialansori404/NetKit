import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  StatusBar,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Appbar,
  Text,
  Portal,
  Dialog,
  TextInput,
  Button,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeModules } from 'react-native';
// @ts-ignore
import SSHClient, { PtyType } from '@dylankenneally/react-native-ssh-sftp';

const XTERM_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #000000;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  #terminal {
    height: 100%;
    width: 100%;
    padding: 4px 6px;
  }
  .xterm {
    height: 100%;
  }
  .xterm-viewport {
    background-color: #000000 !important;
  }
</style>
<link rel="stylesheet" href="file:///android_asset/xterm.css">
</head>
<body>
<div id="terminal"></div>
<script src="file:///android_asset/xterm.js"></script>
<script src="file:///android_asset/xterm-addon-fit.js"></script>
<script>
  function log(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', data: msg }));
    }
  }

  function initTerminal() {
    try {
      window.term = new Terminal({
        theme: {
          background: '#000000',
          foreground: '#E6EDF3',
          cursor: '#22C55E',
          cursorAccent: '#000000',
          selectionBackground: '#264F78',
          black: '#000000',
          red: '#EF4444',
          green: '#22C55E',
          yellow: '#EAB308',
          blue: '#3B82F6',
          magenta: '#A855F7',
          cyan: '#06B6D4',
          white: '#E6EDF3',
          brightBlack: '#4B5563',
          brightRed: '#F87171',
          brightGreen: '#4ADE80',
          brightYellow: '#FDE047',
          brightBlue: '#60A5FA',
          brightMagenta: '#C084FC',
          brightCyan: '#22D3EE',
          brightWhite: '#FFFFFF',
        },
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "DejaVu Sans Mono", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 2000,
        allowProposedApi: true,
      });

      try {
        if (typeof FitAddon !== 'undefined') {
          window.fitAddon = new FitAddon.FitAddon();
          window.term.loadAddon(window.fitAddon);
        }
      } catch (fitErr) {}

      window.term.open(document.getElementById('terminal'));
      try {
        if (window.fitAddon) window.fitAddon.fit();
      } catch (e) {}

      window.addEventListener('resize', function() {
        try { if (window.fitAddon) window.fitAddon.fit(); } catch(e) {}
      });

      window.term.writeln('\\x1b[1;32mNetKit Terminal\\x1b[0m (SSH)');
      window.term.writeln('\\x1b[90mMenghubungkan...\\x1b[0m\\r\\n');

      var isCtrl = false;
      var isAlt = false;

      window.term.onData(function(data) {
        if (isCtrl) {
          isCtrl = false;
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ctrlReset' }));
          }
          if (data.length === 1) {
            var code = data.charCodeAt(0);
            if (code >= 97 && code <= 122) {
              data = String.fromCharCode(code - 96);
            } else if (code >= 65 && code <= 90) {
              data = String.fromCharCode(code - 64);
            } else if (data === ' ') {
              data = '\\x00';
            }
          }
        } else if (isAlt) {
          isAlt = false;
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'altReset' }));
          }
          data = '\\x1b' + data;
        }

        if (data === '\\x7f' || data === '\\b') {
          window.term.write('\\b \\b');
        } else if (data === '\\r') {
          window.term.write('\\r\\n');
        } else if (data.charCodeAt(0) < 32 && data !== '\\t') {
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
    } catch (e) {
      log('INIT_ERROR: ' + e.message);
    }
  }

  if (typeof Terminal !== 'undefined') {
    initTerminal();
  } else {
    window.onload = function() {
      if (typeof Terminal !== 'undefined') {
        initTerminal();
      } else {
        log('LOAD_FAIL: Terminal is undefined');
      }
    };
  }

  function handleRNMessage(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'data' && window.term) window.term.write(msg.data);
      if (msg.type === 'clear' && window.term) window.term.clear();
      if (msg.type === 'setCtrl') isCtrl = !!msg.value;
      if (msg.type === 'setAlt') isAlt = !!msg.value;
      if (msg.type === 'fit' && window.fitAddon) {
        try { window.fitAddon.fit(); } catch(err) {}
      }
    } catch(err) {}
  }
  window.addEventListener('message', handleRNMessage);
  document.addEventListener('message', handleRNMessage);
</script>
</body>
</html>
`;

const TerminalWebView = WebView as any;

export function SshTerminalScreenMD3({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const session = route.params?.session;

  const webviewRef = useRef<WebView>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Menginisialisasi...');
  const [password, setPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);
  const sshClientRef = useRef<any>(null);

  const addDebugLog = (msg: string) => {
    const time = new Date().toTimeString().slice(0, 8);
    setDebugLogs((prev: string[]) => [`[${time}] ${msg}`, ...prev.slice(0, 99)]);
  };

  const sendToTerminal = (data: string) => {
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({ type: 'data', data }));
    }
  };

  const confirmDisconnectAndLeave = useCallback(() => {
    if (connected) {
      Alert.alert(
        'Putuskan Sesi SSH?',
        'Sesi terminal sedang aktif. Keluar akan memutuskan koneksi.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Putuskan & Keluar',
            style: 'destructive',
            onPress: () => {
              try {
                sshClientRef.current?.closeShell();
                sshClientRef.current?.disconnect();
              } catch (e) {}
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [connected, navigation]);

  useEffect(() => {
    const backAction = () => {
      if (connected) {
        confirmDisconnectAndLeave();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [connected, confirmDisconnectAndLeave]);

  useEffect(() => {
    if (terminalReady) {
      connectSsh();
    }
  }, [terminalReady]);

  useEffect(() => {
    return () => {
      if (sshClientRef.current) {
        try {
          sshClientRef.current.closeShell();
          sshClientRef.current.disconnect();
        } catch (e) {}
      }
    };
  }, []);

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready') {
        setTerminalReady(true);
        setStatus('Terminal siap');
      } else if (msg.type === 'input') {
        if (sshClientRef.current && connected) {
          sshClientRef.current.writeToShell(msg.data).catch(() => {});
        }
      } else if (msg.type === 'ctrlReset') {
        setCtrlActive(false);
      } else if (msg.type === 'altReset') {
        setAltActive(false);
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
    setStatus('Menghubungkan ke ' + session.host + '...');

    const { NativeModules } = await import('react-native');
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
        const data = typeof event === 'object' ? event?.value || '' : String(event);
        if (data) {
          sendToTerminal(data);
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
        `${msg}\n\nPeriksa host, port, username, password, dan koneksi jaringan.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'CTRL') {
      const next = !ctrlActive;
      setCtrlActive(next);
      webviewRef.current?.postMessage(JSON.stringify({ type: 'setCtrl', value: next }));
      return;
    }
    if (key === 'ALT') {
      const next = !altActive;
      setAltActive(next);
      webviewRef.current?.postMessage(JSON.stringify({ type: 'setAlt', value: next }));
      return;
    }

    let sendData = '';
    switch (key) {
      case 'ESC': sendData = '\x1b'; break;
      case 'TAB': sendData = '\t'; break;
      case '▲': sendData = '\x1b[A'; break;
      case '▼': sendData = '\x1b[B'; break;
      case '◀': sendData = '\x1b[D'; break;
      case '▶': sendData = '\x1b[C'; break;
      case '-': sendData = '-'; break;
      case '/': sendData = '/'; break;
      case '|': sendData = '|'; break;
      case '~': sendData = '~'; break;
      default: sendData = key;
    }

    if (ctrlActive) {
      setCtrlActive(false);
      webviewRef.current?.postMessage(JSON.stringify({ type: 'setCtrl', value: false }));
      if (sendData.length === 1) {
        const c = sendData.toLowerCase().charCodeAt(0);
        if (c >= 97 && c <= 122) {
          sendData = String.fromCharCode(c - 96);
        }
      }
    }

    if (altActive) {
      setAltActive(false);
      webviewRef.current?.postMessage(JSON.stringify({ type: 'setAlt', value: false }));
      sendData = '\x1b' + sendData;
    }

    if (sshClientRef.current && connected) {
      sshClientRef.current.writeToShell(sendData).catch(() => {});
    }

    if (sendData === '\x1b' || sendData.startsWith('\x1b[')) {
      webviewRef.current?.postMessage(JSON.stringify({ type: 'data', data: sendData }));
    }
  };

  const getStatusDotColor = () => {
    if (connected) return '#22C55E';
    if (status.includes('Gagal') || status.includes('tidak')) return '#EF4444';
    return '#EAB308';
  };

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction color="#E0E0E0" onPress={() => navigation.goBack()} />
          <Appbar.Content title="Sesi tidak ditemukan" titleStyle={styles.headerTitle} />
        </Appbar.Header>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="#E0E0E0" onPress={confirmDisconnectAndLeave} />
        <Appbar.Content
          title={session.nama}
          titleStyle={styles.headerTitle}
          subtitle={
            <View style={styles.subtitleRow}>
              <View style={[styles.statusDot, { backgroundColor: getStatusDotColor() }]} />
              <Text style={styles.subtitleText}>
                {`${session.username}@${session.host}:${session.port}`}
              </Text>
            </View>
          }
        />
        <Appbar.Action
          icon="broom"
          color="#A0A0A0"
          onPress={() => {
            webviewRef.current?.postMessage(JSON.stringify({ type: 'clear' }));
          }}
        />
        <Appbar.Action
          icon="bug-outline"
          color={showDebug ? '#22C55E' : '#707070'}
          onPress={() => setShowDebug(!showDebug)}
        />
      </Appbar.Header>

      {showDebug && (
        <View style={styles.debugPanel}>
          <View style={styles.debugHeader}>
            <Text style={styles.debugTitle}>Debug Log</Text>
            <Button compact textColor="#22C55E" onPress={() => setDebugLogs([])}>
              Clear
            </Button>
          </View>
          <ScrollView style={styles.debugScroll}>
            {debugLogs.length === 0 ? (
              <Text style={{ color: '#777777', fontSize: 11 }}>
                Belum ada log.
              </Text>
            ) : (
              debugLogs.map((log: string, i: number) => (
                <Text key={i} style={styles.debugText} selectable>
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      )}

      <TerminalWebView
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
        onError={(e: any) => {
          addDebugLog(`[WebView Load Error] ${e.nativeEvent.description}`);
          setShowDebug(true);
        }}
      />

      <View style={[styles.accessoryBar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.accessoryContent}
        >
          {['ESC', 'TAB', 'CTRL', 'ALT', '-', '/', '|', '~', '▲', '▼', '◀', '▶'].map((key) => {
            const isActive = (key === 'CTRL' && ctrlActive) || (key === 'ALT' && altActive);
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.6}
                onPress={() => handleKeyPress(key)}
                style={[styles.keyTile, isActive && styles.keyTileActive]}
              >
                <Text style={[styles.keyTileText, isActive && styles.keyTileTextActive]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    elevation: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  subtitleText: {
    color: '#9E9E9E',
    fontSize: 11,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  debugPanel: {
    maxHeight: 180,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  debugTitle: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  debugScroll: {
    maxHeight: 140,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  debugText: {
    color: '#CCCCCC',
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 2,
  },
  accessoryBar: {
    backgroundColor: '#161616',
    borderTopWidth: 1,
    borderTopColor: '#282828',
    paddingTop: 4,
  },
  accessoryContent: {
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  keyTile: {
    backgroundColor: '#262626',
    borderRadius: 4,
    minWidth: 38,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#383838',
  },
  keyTileActive: {
    backgroundColor: '#22C55E',
    borderColor: '#4ADE80',
  },
  keyTileText: {
    color: '#E0E0E0',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },
  keyTileTextActive: {
    color: '#000000',
  },
});
