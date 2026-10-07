/**
 * NetKit - SftpScreen (Browser File & Transfer SFTP)
 * Sesuai DESIGN.md §4.7 & Mockup 05-sftp-light-v7.png
 * - Daftar sesi SFTP
 * - Browser: path bar (/home/bpr/), tombol up (^), daftar file/folder (FileRow)
 * - Tombol Download & Upload
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../ui/theme';
import {
  InstrumentHeader,
  SessionRow,
  FileRow,
  ChunkyButton,
} from '../ui/components';
import { store, SshSession } from '../storage/storage';

interface SftpItem {
  name: string;
  isDir: boolean;
  size: string;
  date: string;
}

const INITIAL_FILES: Record<string, SftpItem[]> = {
  '/home/bpr/': [
    { name: 'logs', isDir: true, size: '4,1 MB', date: '10:12' },
    { name: 'backup', isDir: true, size: '812 MB', date: 'kemarin' },
    { name: 'app.conf', isDir: false, size: '2,4 KB', date: '10:05' },
    { name: 'gw.log', isDir: false, size: '18 MB', date: '10:41' },
    { name: 'restart.sh', isDir: false, size: '1,1 KB', date: '09:20' },
  ],
  '/home/bpr/logs/': [
    { name: 'ibs-gw.2026-10-07.log', isDir: false, size: '2,1 MB', date: '10:10' },
    { name: 'error.log', isDir: false, size: '124 KB', date: '08:30' },
  ],
  '/home/bpr/backup/': [
    { name: 'db-dump-20261006.sql.gz', isDir: false, size: '812 MB', date: 'kemarin' },
  ],
};

interface SftpScreenProps {
  onOpenSettings: () => void;
}

export const SftpScreen: React.FC<SftpScreenProps> = ({ onOpenSettings }) => {
  const sessions = store.getSessions();
  const [activeSession, setActiveSession] = useState<SshSession | null>(null);
  const [currentPath, setCurrentPath] = useState('/home/bpr/');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const files = INITIAL_FILES[currentPath] || [
    { name: 'empty', isDir: false, size: '0 B', date: 'baru' },
  ];

  const handleOpenBrowser = (session: SshSession) => {
    setActiveSession(session);
    setCurrentPath('/home/bpr/');
    setStatusNotice(null);
  };

  const handleBackToSessions = () => {
    setActiveSession(null);
    setStatusNotice(null);
  };

  const handleItemPress = (item: SftpItem) => {
    if (item.isDir) {
      const nextPath = `${currentPath}${item.name}/`;
      setCurrentPath(nextPath);
      setStatusNotice(`Buka folder: ${item.name}`);
      setTimeout(() => setStatusNotice(null), 2000);
    } else {
      setStatusNotice(`Pilih file: ${item.name} (${item.size})`);
      setTimeout(() => setStatusNotice(null), 2500);
    }
  };

  const handleUpDir = () => {
    if (currentPath === '/home/bpr/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const upPath = '/' + parts.join('/') + '/';
    setCurrentPath(upPath);
    setStatusNotice(`Naik ke: ${upPath}`);
    setTimeout(() => setStatusNotice(null), 2000);
  };

  const handleDownload = () => {
    setStatusNotice(`Mengunduh berkas aktif dari ${currentPath}... Sukses.`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleUpload = () => {
    setStatusNotice(`Mengunggah berkas ke ${currentPath}... Berhasil.`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  if (activeSession) {
    return (
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.browserHeader}>
          <TouchableOpacity
            onPress={handleBackToSessions}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>&lt;</Text>
          </TouchableOpacity>
          <Text style={styles.browserTitle}>SFTP · {activeSession.nama}</Text>
        </View>

        {/* Path bar */}
        <View style={styles.pathBarContainer}>
          <Text style={styles.pathText}>{currentPath}</Text>
          <TouchableOpacity
            onPress={handleUpDir}
            style={styles.upBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.upBtnText}>^</Text>
          </TouchableOpacity>
        </View>

        {statusNotice ? (
          <View style={styles.noticeBar}>
            <Text style={styles.noticeText}>{statusNotice}</Text>
          </View>
        ) : null}

        {/* File List */}
        <ScrollView contentContainerStyle={styles.fileListContent}>
          <View style={styles.fileListCard}>
            {files.map((f) => (
              <FileRow
                key={f.name}
                isDir={f.isDir}
                name={f.name}
                size={f.size}
                date={f.date}
                onPress={() => handleItemPress(f)}
              />
            ))}
          </View>

          {/* Action buttons Download & Upload */}
          <View style={styles.actionRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <ChunkyButton
                title="Download"
                onPress={handleDownload}
                variant="outline"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <ChunkyButton
                title="Upload"
                onPress={handleUpload}
                variant="solid"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Sesi SFTP List
  return (
    <View style={styles.container}>
      <InstrumentHeader
        wordmark="SFTP"
        stats={[
          { label: 'SESI', value: sessions.length },
          { label: 'CHANNEL', value: 'SUBSYS' },
          { label: 'AUTH', value: 'KEYSTORE' },
        ]}
        onGearPress={onOpenSettings}
        showGear
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PILIH SESI SERVER</Text>
        </View>

        <View style={styles.sessionListContainer}>
          {sessions.map((sess) => (
            <SessionRow
              key={sess.id}
              nama={sess.nama}
              endpoint={`${sess.username}@${sess.host}:${sess.port}`}
              onPress={() => handleOpenBrowser(sess)}
            />
          ))}
        </View>
      </ScrollView>
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
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.margin,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.bg,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 12,
  },
  backBtnText: {
    fontSize: theme.sizes.xxl,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    color: theme.colors.dim,
  },
  browserTitle: {
    fontSize: theme.sizes.lg,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
  },
  pathBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.panel,
    marginHorizontal: theme.spacing.margin,
    marginVertical: theme.spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  pathText: {
    fontSize: theme.sizes.base,
    fontFamily: theme.fonts.mono,
    fontWeight: '500',
    color: theme.colors.text,
  },
  upBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  upBtnText: {
    fontSize: theme.sizes.lg,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    color: theme.colors.dim,
  },
  noticeBar: {
    marginHorizontal: theme.spacing.margin,
    marginBottom: 8,
    backgroundColor: theme.colors.accentDim,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radii.sm,
  },
  noticeText: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    color: theme.colors.accent,
  },
  fileListContent: {
    paddingHorizontal: theme.spacing.margin,
    paddingBottom: 80,
  },
  fileListCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
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
});
