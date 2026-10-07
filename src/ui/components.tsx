/**
 * NetKit Custom Component Kit
 * Sesuai DESIGN.md §6.3:
 * InstrumentHeader, WavyNavBar, CenterFab, TerminalSearch, ChunkyButton,
 * ClientRow, SpecSheet, ToolCard, LogBlock, TerminalView, FileRow, SessionRow
 * Aturan keras: BUKAN Paper. Semua warna WAJIB dari theme.ts.
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { theme } from './theme';

// 1. InstrumentHeader
// Wordmark + 3 stat (angka mono besar + micro label); slot aksi kanan (gear)
interface InstrumentHeaderProps {
  wordmark?: string;
  stats?: Array<{ label: string; value: number | string; color?: string }>;
  onGearPress?: () => void;
  showGear?: boolean;
}

export const InstrumentHeader: React.FC<InstrumentHeaderProps> = ({
  wordmark = 'NETKIT',
  stats = [],
  onGearPress,
  showGear = true,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.wordmark}>{wordmark}</Text>
        {showGear && (
          <TouchableOpacity
            style={styles.gearButton}
            onPress={onGearPress}
            activeOpacity={0.7}
            accessibilityLabel="Pengaturan"
          >
            <Text style={styles.gearIcon}>⚙</Text>
          </TouchableOpacity>
        )}
      </View>

      {stats.length > 0 && (
        <View style={styles.statsRow}>
          {stats.map((st, i) => (
            <React.Fragment key={st.label}>
              <View style={styles.statBox}>
                <Text
                  style={[
                    styles.statValue,
                    { color: st.color || theme.colors.text },
                  ]}
                >
                  {st.value}
                </Text>
                <Text style={styles.statLabel}>{st.label}</Text>
              </View>
              {i < stats.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
};

// 2. TerminalSearch
// Panel putih + prompt '>' accent + hint mono
interface TerminalSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const TerminalSearch: React.FC<TerminalSearchProps> = ({
  value,
  onChangeText,
  placeholder = 'cari bpr / ip_',
}) => {
  return (
    <View style={styles.searchContainer}>
      <Text style={styles.searchPrompt}>&gt;</Text>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.faint}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

// 3. ChunkyButton
// Tombol penuh accent / outline
interface ChunkyButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

export const ChunkyButton: React.FC<ChunkyButtonProps> = ({
  title,
  onPress,
  variant = 'solid',
  disabled = false,
  style,
}) => {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      style={[
        styles.chunkyBtn,
        isOutline ? styles.chunkyBtnOutline : styles.chunkyBtnSolid,
        disabled && styles.chunkyBtnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.chunkyBtnText,
          isOutline ? styles.chunkyBtnTextOutline : styles.chunkyBtnTextSolid,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// 4. ClientRow
// Nama • alamat • ip:port mono + tag ·lokal/·publik; TANPA dot status
interface ClientRowProps {
  namaBpr: string;
  alamat: string;
  ipGateway: string;
  port: number;
  isLokal: boolean;
  onPress: () => void;
}

export const ClientRow: React.FC<ClientRowProps> = ({
  namaBpr,
  alamat,
  ipGateway,
  port,
  isLokal,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.clientRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.clientRowLeft}>
        <Text style={styles.clientName}>{namaBpr}</Text>
        <Text style={styles.clientAddr} numberOfLines={1}>
          {alamat}
        </Text>
      </View>
      <View style={styles.clientRowRight}>
        <Text style={styles.clientEndpoint}>{`${ipGateway}:${port}`}</Text>
        <Text
          style={[
            styles.clientTag,
            { color: isLokal ? theme.colors.dim : theme.colors.accent },
          ]}
        >
          {isLokal ? '·lokal' : '·publik'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// 5. SpecSheet
// Baris label:nilai + ikon copy
interface SpecSheetRow {
  label: string;
  value: string;
  isMono?: boolean;
}

interface SpecSheetProps {
  rows: SpecSheetRow[];
  onCopyRow?: (label: string, value: string) => void;
}

export const SpecSheet: React.FC<SpecSheetProps> = ({ rows, onCopyRow }) => {
  return (
    <View style={styles.specSheetContainer}>
      {rows.map((row, idx) => (
        <View key={row.label} style={styles.specSheetRow}>
          <Text style={styles.specLabel}>{row.label}</Text>
          <View style={styles.specValueContainer}>
            <Text
              style={[
                styles.specValue,
                row.isMono ? styles.monoFont : styles.sansFont,
              ]}
              selectable
            >
              {row.value || '—'}
            </Text>
            {onCopyRow && row.value && (
              <TouchableOpacity
                onPress={() => onCopyRow(row.label, row.value)}
                style={styles.copyBtn}
              >
                <Text style={styles.copyBtnText}>📋</Text>
              </TouchableOpacity>
            )}
          </View>
          {idx < rows.length - 1 && <View style={styles.specDivider} />}
        </View>
      ))}
    </View>
  );
};

// 6. ToolCard
// Kartu grid hub (judul mono + sub dim)
interface ToolCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  subtitle,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.toolCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.toolCardTitle}>{title}</Text>
      <Text style={styles.toolCardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

// 7. LogBlock
// Blok hasil: varian terang (panel putih) & terminal (gelap, prompt hijau)
interface LogBlockProps {
  content: string;
  variant?: 'terminal' | 'light';
  lines?: Array<{ text: string; color?: string }>;
}

export const LogBlock: React.FC<LogBlockProps> = ({
  content,
  variant = 'terminal',
  lines,
}) => {
  const isTerminal = variant === 'terminal';
  return (
    <View
      style={[
        styles.logBlockContainer,
        isTerminal ? styles.logBlockTerminal : styles.logBlockLight,
      ]}
    >
      <ScrollView nestedScrollEnabled style={styles.logScrollView}>
        {lines && lines.length > 0 ? (
          lines.map((l, idx) => (
            <Text
              key={idx}
              style={[
                styles.logLine,
                {
                  color:
                    l.color ||
                    (isTerminal
                      ? theme.colors.termText
                      : theme.colors.text),
                },
              ]}
            >
              {l.text}
            </Text>
          ))
        ) : (
          <Text
            style={[
              styles.logLine,
              {
                color: isTerminal
                  ? theme.colors.termText
                  : theme.colors.text,
              },
            ]}
          >
            {content}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

// 8. TerminalView
// Terminal SSH full pty: bridge view + extra key row (Esc/Ctrl/Tab/arrows)
interface TerminalViewProps {
  output: string[];
  command: string;
  onChangeCommand: (cmd: string) => void;
  onSubmitCommand: () => void;
  onSendSpecialKey: (key: string) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  output,
  command,
  onChangeCommand,
  onSubmitCommand,
  onSendSpecialKey,
}) => {
  const extraKeys = ['Esc', 'Ctrl', 'Tab', '←', '→', '|'];

  return (
    <View style={styles.termContainer}>
      {/* Terminal Output */}
      <ScrollView style={styles.termOutputArea}>
        {output.map((line, idx) => (
          <Text key={idx} style={styles.termLine}>
            {line}
          </Text>
        ))}
      </ScrollView>

      {/* Extra Key Row */}
      <View style={styles.extraKeyRow}>
        {extraKeys.map((k) => (
          <TouchableOpacity
            key={k}
            style={styles.extraKeyButton}
            onPress={() => onSendSpecialKey(k)}
          >
            <Text style={styles.extraKeyText}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Terminal Input Bar */}
      <View style={styles.termInputBar}>
        <Text style={styles.termPrompt}>&gt;</Text>
        <TextInput
          style={styles.termInput}
          value={command}
          onChangeText={onChangeCommand}
          placeholder="ketik perintah_"
          placeholderTextColor={theme.colors.termDim}
          onSubmitEditing={onSubmitCommand}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
        />
      </View>
    </View>
  );
};

// 9. FileRow
// Ikon folder/file • nama • ukuran mono • tanggal dim
interface FileRowProps {
  isDir: boolean;
  name: string;
  size: string;
  date: string;
  onPress: () => void;
}

export const FileRow: React.FC<FileRowProps> = ({
  isDir,
  name,
  size,
  date,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.fileRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.fileRowLeft}>
        <Text style={styles.fileIcon}>{isDir ? '📁' : '📄'}</Text>
        <Text style={[styles.fileName, isDir && styles.monoFont]}>
          {name}
        </Text>
      </View>
      <View style={styles.fileRowRight}>
        <Text style={styles.fileSize}>{size}</Text>
        <Text style={styles.fileDate}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

// 10. SessionRow
// Nama sesi • user@host:port mono
interface SessionRowProps {
  nama: string;
  endpoint: string;
  onPress: () => void;
  onDelete?: () => void;
}

export const SessionRow: React.FC<SessionRowProps> = ({
  nama,
  endpoint,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.sessionRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View>
        <Text style={styles.sessionName}>{nama}</Text>
        <Text style={styles.sessionEndpoint}>{endpoint}</Text>
      </View>
      <Text style={styles.sessionArrow}>&gt;</Text>
    </TouchableOpacity>
  );
};

// 11. CenterFab & WavyNavBar
interface WavyNavBarProps {
  activeTab: 'Klien' | 'Tools' | 'SSH' | 'SFTP';
  onSelectTab: (tab: 'Klien' | 'Tools' | 'SSH' | 'SFTP') => void;
  onFabPress: () => void;
}

export const WavyNavBar: React.FC<WavyNavBarProps> = ({
  activeTab,
  onSelectTab,
  onFabPress,
}) => {
  const tabs: Array<{
    name: 'Klien' | 'Tools' | 'SSH' | 'SFTP';
    icon: string;
  }> = [
    { name: 'Klien', icon: '🏛' },
    { name: 'Tools', icon: '🛠' },
    { name: 'SSH', icon: '💻' },
    { name: 'SFTP', icon: '📁' },
  ];

  return (
    <View style={styles.navBarWrapper}>
      <View style={styles.navBarContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.navItem}
              onPress={() => onSelectTab(tab.name)}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: isActive
                      ? theme.colors.accent
                      : theme.colors.dim,
                  },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* FAB Center */}
      <TouchableOpacity
        style={styles.centerFab}
        onPress={onFabPress}
        activeOpacity={0.8}
        accessibilityLabel="Tambah"
      >
        <Text style={styles.centerFabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  sansFont: {
    fontFamily: theme.fonts.sans,
  },
  monoFont: {
    fontFamily: theme.fonts.mono,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.margin,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.bg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  wordmark: {
    fontSize: theme.sizes.sm,
    fontWeight: '700',
    letterSpacing: 4,
    color: theme.colors.faint,
    fontFamily: theme.fonts.sans,
  },
  gearButton: {
    padding: theme.spacing.xs,
  },
  gearIcon: {
    fontSize: 20,
    color: theme.colors.dim,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
  },
  statLabel: {
    fontSize: theme.sizes.micro,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.faint,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.hairline,
    marginHorizontal: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    marginHorizontal: theme.spacing.margin,
    marginVertical: theme.spacing.sm,
  },
  searchPrompt: {
    fontSize: theme.sizes.lg,
    fontWeight: '700',
    color: theme.colors.accent,
    fontFamily: theme.fonts.mono,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.sizes.base,
    fontFamily: theme.fonts.mono,
    color: theme.colors.text,
    padding: 0,
  },
  chunkyBtn: {
    height: 48,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  chunkyBtnSolid: {
    backgroundColor: theme.colors.accent,
  },
  chunkyBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  chunkyBtnDisabled: {
    opacity: 0.5,
  },
  chunkyBtnText: {
    fontSize: theme.sizes.base,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
  },
  chunkyBtnTextSolid: {
    color: theme.colors.white,
  },
  chunkyBtnTextOutline: {
    color: theme.colors.accent,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.margin,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  clientRowLeft: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  clientName: {
    fontSize: theme.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clientAddr: {
    fontSize: theme.sizes.xs,
    color: theme.colors.dim,
    marginTop: 2,
  },
  clientRowRight: {
    alignItems: 'flex-end',
  },
  clientEndpoint: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.mono,
    color: theme.colors.text,
  },
  clientTag: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    marginTop: 2,
  },
  specSheetContainer: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    overflow: 'hidden',
  },
  specSheetRow: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  specLabel: {
    fontSize: theme.sizes.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.faint,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  specValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specValue: {
    fontSize: theme.sizes.base,
    color: theme.colors.text,
    flex: 1,
  },
  copyBtn: {
    paddingLeft: theme.spacing.sm,
  },
  copyBtnText: {
    fontSize: 14,
  },
  specDivider: {
    height: 1,
    backgroundColor: theme.colors.hairline,
    marginTop: theme.spacing.md,
  },
  toolCard: {
    flex: 1,
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    padding: theme.spacing.md,
    justifyContent: 'center',
    minHeight: 88,
  },
  toolCardTitle: {
    fontSize: theme.sizes.md,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    color: theme.colors.text,
  },
  toolCardSubtitle: {
    fontSize: theme.sizes.xs,
    color: theme.colors.dim,
    marginTop: 4,
  },
  logBlockContainer: {
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    minHeight: 180,
    maxHeight: 280,
  },
  logBlockTerminal: {
    backgroundColor: theme.colors.termBg,
  },
  logBlockLight: {
    backgroundColor: theme.colors.panel,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  logScrollView: {
    flex: 1,
  },
  logLine: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    lineHeight: 18,
    marginVertical: 1,
  },
  termContainer: {
    flex: 1,
    backgroundColor: theme.colors.termBg,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
  },
  termOutputArea: {
    flex: 1,
    padding: theme.spacing.xs,
  },
  termLine: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    color: theme.colors.termText,
    lineHeight: 18,
  },
  extraKeyRow: {
    flexDirection: 'row',
    backgroundColor: '#161B22',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: theme.radii.sm,
    marginVertical: 4,
    justifyContent: 'space-around',
  },
  extraKeyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#21262D',
  },
  extraKeyText: {
    color: theme.colors.termText,
    fontFamily: theme.fonts.mono,
    fontSize: theme.sizes.xs,
  },
  termInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    height: 40,
  },
  termPrompt: {
    color: theme.colors.termGreen,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    fontSize: theme.sizes.sm,
    marginRight: 6,
  },
  termInput: {
    flex: 1,
    color: theme.colors.termText,
    fontFamily: theme.fonts.mono,
    fontSize: theme.sizes.sm,
    padding: 0,
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  fileRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  fileIcon: {
    fontSize: 18,
  },
  fileName: {
    fontSize: theme.sizes.base,
    color: theme.colors.text,
  },
  fileRowRight: {
    alignItems: 'flex-end',
  },
  fileSize: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    color: theme.colors.text,
  },
  fileDate: {
    fontSize: theme.sizes.micro,
    color: theme.colors.dim,
    marginTop: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sessionName: {
    fontSize: theme.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sessionEndpoint: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    color: theme.colors.dim,
    marginTop: 2,
  },
  sessionArrow: {
    fontSize: theme.sizes.md,
    fontFamily: theme.fonts.mono,
    color: theme.colors.faint,
  },
  navBarWrapper: {
    position: 'relative',
    backgroundColor: theme.colors.panel,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  navBarContainer: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: theme.sizes.micro,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
  },
  centerFab: {
    position: 'absolute',
    top: -24,
    left: '50%',
    marginLeft: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  centerFabIcon: {
    fontSize: 28,
    color: theme.colors.white,
    lineHeight: 30,
    fontWeight: '300',
  },
});
