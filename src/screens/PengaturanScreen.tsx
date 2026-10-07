/**
 * NetKit - PengaturanScreen (Pengaturan & Info Sistem)
 * Sesuai DESIGN.md §4.8 & Mockup 06-pengaturan-light-v7-pty.png
 * - Info Versi: 0.1.0-proto
 * - Mode: offline · tanpa backend
 * - Kredensial SSH: Keychain / Keystore
 * - Terminal SSH: Full pty (xterm.js), extra key row, vim/htop jalan
 * - Data: Hapus semua data (konfirmasi modal/alert)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { theme } from '../ui/theme.js';
import { ChunkyButton } from '../ui/components.js';
import { store } from '../storage/storage.js';

interface PengaturanScreenProps {
  onBack: () => void;
  onDataReset?: () => void;
}

export const PengaturanScreen: React.FC<PengaturanScreenProps> = ({
  onBack,
  onDataReset,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleConfirmReset = () => {
    store.resetAll();
    setShowConfirmModal(false);
    setResetSuccess(true);
    if (onDataReset) onDataReset();
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Pengaturan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section APLIKASI */}
        <Text style={styles.microLabel}>APLIKASI</Text>
        <View style={styles.cardPanel}>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Versi</Text>
            <Text style={styles.rowValue}>0.1.0-proto</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Mode</Text>
            <Text style={styles.rowValue}>offline · tanpa backend</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Kredensial SSH</Text>
            <Text style={styles.rowValue}>Keychain / Keystore</Text>
          </View>
        </View>

        {/* Section TERMINAL SSH (Info Full PTY) */}
        <Text style={styles.microLabel}>TERMINAL SSH</Text>
        <View style={styles.ptyCard}>
          <Text style={styles.ptyTitle}>Full pty (xterm.js).</Text>
          <Text style={styles.ptyDesc}>Extra key: Esc · Ctrl · Tab · panah.</Text>
          <Text style={styles.ptyDesc}>vim / htop jalan.</Text>
        </View>

        {/* Section DATA */}
        <Text style={styles.microLabel}>DATA</Text>
        <TouchableOpacity
          style={styles.cardPanel}
          onPress={() => setShowConfirmModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.deleteRow}>
            <Text style={styles.deleteText}>Hapus semua data</Text>
            <Text style={styles.deleteArrow}>&gt;</Text>
          </View>
        </TouchableOpacity>

        {resetSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Semua data berhasil dihapus.</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Konfirmasi Hapus Data */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeading}>HAPUS SEMUA DATA?</Text>
            <Text style={styles.modalBody}>
              Tindakan ini akan mengosongkan seluruh daftar klien, riwayat diagnostik,
              dan sesi SSH/SFTP. Aksi ini tidak dapat dibatalkan.
            </Text>

            <View style={styles.modalActionRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <ChunkyButton
                  title="Batal"
                  onPress={() => setShowConfirmModal(false)}
                  variant="outline"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <ChunkyButton
                  title="Hapus"
                  onPress={handleConfirmReset}
                  variant="solid"
                  style={{ backgroundColor: theme.colors.fail }}
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
  navBar: {
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
  screenTitle: {
    fontSize: theme.sizes.xl,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
  },
  scrollContent: {
    padding: theme.spacing.margin,
    paddingBottom: 80,
  },
  microLabel: {
    fontSize: theme.sizes.micro,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.faint,
    marginTop: theme.spacing.base,
    marginBottom: 8,
  },
  cardPanel: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: theme.sizes.base,
    fontFamily: theme.fonts.sans,
    color: theme.colors.text,
  },
  rowValue: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.mono,
    color: theme.colors.dim,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.hairline,
    marginHorizontal: 16,
  },
  ptyCard: {
    backgroundColor: theme.colors.accentDim,
    borderRadius: theme.radii.md,
    padding: 16,
  },
  ptyTitle: {
    fontSize: theme.sizes.base,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  ptyDesc: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.sans,
    color: theme.colors.dim,
    marginTop: 2,
  },
  deleteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  deleteText: {
    fontSize: theme.sizes.base,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.fail,
  },
  deleteArrow: {
    fontSize: theme.sizes.lg,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    color: theme.colors.faint,
  },
  successBanner: {
    backgroundColor: theme.colors.accentDim,
    marginTop: 16,
    padding: 12,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
  },
  successText: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.sans,
    color: theme.colors.ok,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.margin,
  },
  modalBox: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  modalHeading: {
    fontSize: theme.sizes.md,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.sans,
    color: theme.colors.dim,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
  },
});
