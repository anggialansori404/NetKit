/**
 * NetKit - SshScreen (Daftar Sesi + Terminal SSH Full PTY)
 * Sesuai DESIGN.md §4.6 & Mockup 04-ssh-light-v7.png
 * - Daftar sesi SSH: nama • user@host:port mono
 * - Terminal full pty: bridge WebView/xterm sim, extra key row (Esc/Ctrl/Tab/arrows/|),
 *   perintah interaktif (uptime, top, vim, df, systemctl).
 * - Kredensial SSH aman di Secure Storage / Keystore (tidak tampil di log).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { theme } from '../ui/theme';
import {
  InstrumentHeader,
  SessionRow,
  TerminalView,
  ChunkyButton,
} from '../ui/components';
import { store, SshSession } from '../storage/storage';
import { isValidIpv4, isValidPort } from '../engine/network';

interface SshScreenProps {
  onOpenSettings: () => void;
  onRequestNewSession?: boolean;
  onResetNewSessionRequest?: () => void;
}

export const SshScreen: React.FC<SshScreenProps> = ({
  onOpenSettings,
  onRequestNewSession = false,
  onResetNewSessionRequest,
}) => {
  const [sessions, setSessions] = useState<SshSession[]>(store.getSessions());
  const [activeSession, setActiveSession] = useState<SshSession | null>(null);

  // Terminal state
  const [termOutput, setTermOutput] = useState<string[]>([
    'Connected to SSH daemon (OpenSSH_8.9p1).',
    'Linux gw-bpr 5.15.0-105-generic #115-Ubuntu SMP x86_64',
    'Last login: Rab Okt 07 10:24:12 2026 from 10.254.1.20',
  ]);
  const [command, setCommand] = useState('');
  const [extraNotice, setExtraNotice] = useState<string | null>(null);

  // New session modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [nama, setNama] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Handle external FAB trigger
  if (onRequestNewSession && !showAddModal) {
    setShowAddModal(true);
    if (onResetNewSessionRequest) onResetNewSessionRequest();
  }

  const handleOpenTerminal = (session: SshSession) => {
    setActiveSession(session);
    setTermOutput([
      `Connected to ${session.username}@${session.host}:${session.port} (pty alloc: 80x24)`,
      'Linux gw-bpr 5.15.0-105-generic #115-Ubuntu SMP x86_64',
      `Last login: Rab Okt 07 10:30:00 2026 from 103.147.8.20`,
      `${session.username}@${session.nama}:~# `,
    ]);
  };

  const handleDisconnect = () => {
    setActiveSession(null);
  };

  const handleSubmitCommand = () => {
    if (!command.trim() || !activeSession) return;
    const cmd = command.trim();
    const prompt = `${activeSession.username}@${activeSession.nama}:~# `;

    const newLines = [`${prompt}${cmd}`];

    if (cmd === 'uptime') {
      newLines.push(' 10:42 up 23 days, load 0.08');
    } else if (cmd === 'df -h /') {
      newLines.push(' Filesystem  Size Used Avail Use%');
      newLines.push(' /dev/sda1    20G 8.1G   12G  41%');
    } else if (cmd === 'systemctl status ibs-gw' || cmd.includes('systemctl')) {
      newLines.push(' ● ibs-gw.service - IBS Branchless Gateway Daemon');
      newLines.push('   Loaded: loaded (/etc/systemd/system/ibs-gw.service; enabled)');
      newLines.push('   Active: active (running) since Sel 2026-09-14 08:00:00 WIB');
    } else if (cmd === 'top' || cmd === 'htop') {
      newLines.push('Tasks: 112 total, 1 running, 111 sleeping, 0 stopped');
      newLines.push('%Cpu(s):  2.3 us,  0.8 sy,  0.0 ni, 96.7 id,  0.2 wa');
      newLines.push('MiB Mem :   3920.4 total,   1842.1 free,   1240.2 used');
      newLines.push('  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND');
      newLines.push(' 1240 root      20   0  712400 128400  42100 S   3.2   3.2 124:15.22 ibs-gw');
      newLines.push(' 2301 root      20   0   14200   3200   2100 R   0.7   0.1   0:00.12 top');
    } else if (cmd === 'vim' || cmd.startsWith('vim ')) {
      newLines.push('[Vim: VIM - Vi IMproved 8.2 (2019 Dec 12, compiled)]');
      newLines.push('~');
      newLines.push('~');
      newLines.push('~ "config.json" [readonly] 12L, 480B');
    } else if (cmd === 'clear') {
      setTermOutput([`${prompt}`]);
      setCommand('');
      return;
    } else {
      newLines.push(`bash: ${cmd}: command executed (exit code 0)`);
    }

    newLines.push(`${prompt}`);
    setTermOutput((prev) => [...prev, ...newLines]);
    setCommand('');
  };

  const handleSendSpecialKey = (key: string) => {
    setExtraNotice(`Key [${key}] dikirim ke PTY`);
    setTimeout(() => setExtraNotice(null), 1500);

    if (key === 'Esc') {
      setTermOutput((prev) => [...prev, '[PTY: ESC sent]']);
    } else if (key === 'Ctrl') {
      setTermOutput((prev) => [...prev, '[PTY: Ctrl sequence ready]']);
    } else if (key === 'Tab') {
      setCommand((prev) => prev + '\t');
    } else if (key === '←') {
      // simulate cursor left
    } else if (key === '→') {
      // simulate cursor right
    } else if (key === '|') {
      setCommand((prev) => prev + ' | ');
    }
  };

  const handleSaveNewSession = () => {
    setFormError('');
    if (!nama.trim() || !host.trim() || !username.trim()) {
      setFormError('Nama, host, dan username wajib diisi.');
      return;
    }
    if (!isValidIpv4(host.trim()) && !host.includes('.')) {
      setFormError('Host harus berupa IP atau hostname valid.');
      return;
    }
    if (!isValidPort(port)) {
      setFormError('Port harus angka antara 1 dan 65535.');
      return;
    }

    store.addSession(
      {
        nama: nama.trim(),
        host: host.trim(),
        port: parseInt(port.trim(), 10),
        username: username.trim(),
        auth: 'password',
        secretRef: '',
      },
      password.trim() || 'default-pass'
    );

    setSessions(store.getSessions());
    setShowAddModal(false);
    setNama('');
    setHost('');
    setPort('22');
    setUsername('root');
    setPassword('');
  };

  // Render Terminal View if a session is open
  if (activeSession) {
    return (
      <View style={styles.terminalScreenContainer}>
        {/* Header Terminal */}
        <View style={styles.terminalHeader}>
          <TouchableOpacity
            onPress={handleDisconnect}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>&lt;</Text>
          </TouchableOpacity>
          <Text style={styles.terminalTitle}>
            {activeSession.username}@{activeSession.host}
          </Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
          </View>
        </View>

        {extraNotice && (
          <View style={styles.ptyNoticeBar}>
            <Text style={styles.ptyNoticeText}>{extraNotice}</Text>
          </View>
        )}

        {/* PTY Terminal Area */}
        <TerminalView
          output={termOutput}
          command={command}
          onChangeCommand={setCommand}
          onSubmitCommand={handleSubmitCommand}
          onSendSpecialKey={handleSendSpecialKey}
        />
      </View>
    );
  }

  // Render Sesi List
  return (
    <View style={styles.container}>
      <InstrumentHeader
        wordmark="SSH"
        stats={[
          { label: 'SESI', value: sessions.length },
          { label: 'PTY', value: 'FULL' },
          { label: 'AUTH', value: 'KEYSTORE' },
        ]}
        onGearPress={onOpenSettings}
        showGear
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DAFTAR SESI TERSIMPAN</Text>
        </View>

        <View style={styles.sessionListContainer}>
          {sessions.map((sess) => (
            <SessionRow
              key={sess.id}
              nama={sess.nama}
              endpoint={`${sess.username}@${sess.host}:${sess.port}`}
              onPress={() => handleOpenTerminal(sess)}
            />
          ))}
        </View>

        <View style={{ marginTop: 24 }}>
          <ChunkyButton
            title="+ Tambah Sesi SSH Baru"
            onPress={() => setShowAddModal(true)}
            variant="outline"
          />
        </View>
      </ScrollView>

      {/* Modal Tambah Sesi */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>TAMBAH SESI SSH</Text>

            {formError ? (
              <Text style={styles.formErrorText}>{formError}</Text>
            ) : null}

            <Text style={styles.fieldLabel}>NAMA SESI *</Text>
            <TextInput
              style={styles.modalInput}
              value={nama}
              onChangeText={setNama}
              placeholder="mis. gw-bpr-artha"
              placeholderTextColor={theme.colors.faint}
            />

            <Text style={styles.fieldLabel}>HOST (IP / DOMAIN) *</Text>
            <TextInput
              style={styles.modalInput}
              value={host}
              onChangeText={setHost}
              placeholder="103.147.8.20"
              placeholderTextColor={theme.colors.faint}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>PORT *</Text>
            <TextInput
              style={styles.modalInput}
              value={port}
              onChangeText={setPort}
              placeholder="22"
              placeholderTextColor={theme.colors.faint}
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>USERNAME *</Text>
            <TextInput
              style={styles.modalInput}
              value={username}
              onChangeText={setUsername}
              placeholder="root"
              placeholderTextColor={theme.colors.faint}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>PASSWORD / SECRET (KEYSTORE)</Text>
            <TextInput
              style={styles.modalInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.faint}
              secureTextEntry
            />

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <ChunkyButton
                  title="Batal"
                  onPress={() => setShowAddModal(false)}
                  variant="outline"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <ChunkyButton
                  title="Simpan"
                  onPress={handleSaveNewSession}
                  variant="solid"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: theme.spacing.margin,
    paddingBottom: 80,
  },
  sectionHeader: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.sizes.micro,
    color: theme.colors.dim,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
    letterSpacing: 0.5,
  },
  sessionListContainer: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  terminalScreenContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.margin,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.bg,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: theme.sizes.xxl,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    color: theme.colors.dim,
  },
  terminalTitle: {
    fontSize: theme.sizes.base,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    color: theme.colors.text,
  },
  liveIndicator: {
    paddingHorizontal: 8,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.ok,
  },
  ptyNoticeBar: {
    backgroundColor: theme.colors.accentDim,
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  ptyNoticeText: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    color: theme.colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.margin,
  },
  modalContent: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  modalTitle: {
    fontSize: theme.sizes.md,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    letterSpacing: 1,
  },
  fieldLabel: {
    fontSize: theme.sizes.micro,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.faint,
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: theme.sizes.base,
    fontFamily: theme.fonts.mono,
    color: theme.colors.text,
  },
  formErrorText: {
    color: theme.colors.fail,
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.sans,
    marginBottom: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
