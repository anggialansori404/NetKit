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
import Svg, { Path } from 'react-native-svg';

// NavIcon — ikon garis outline ala mockup (bukan emoji).
// stroke mengikuti prop color: aktif = accent, nonaktif = dim.
const NavIcon: React.FC<{ name: 'Klien' | 'Tools' | 'SSH' | 'SFTP' | 'File'; color: string }> = ({
  name,
  color,
}) => {
  const paths: Record<string, string> = {
    // house outline
    Klien: 'M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-6h4v6',
    // wrench
    Tools:
      'M14.5 6.5a4 4 0 0 0-5.6 4.8L4 16.2V20h3.8l4.9-4.9a4 4 0 0 0 4.8-5.6l-2.9 2.9-2.5-2.5 2.4-3.4z',
    // terminal >_
    SSH: 'M5 7l5 5-5 5M12 17h7M4 4h16v16H4z',
    // folder
    SFTP: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    // file/doc
    File: 'M6 2h8l5 5v15H6zM14 2v5h5',
  };
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

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
            <GearIconSvg />
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
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {st.value}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {st.label}
                </Text>
              </View>
              {i < stats.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
};

// GearIcon — ikon gear garis untuk slot aksi header
const GearIconSvg: React.FC = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      stroke={theme.colors.dim}
      strokeWidth={1.8}
    />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={theme.colors.dim}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 9h11v11H9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                    stroke={theme.colors.dim}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
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
        {output.length === 0 ? (
          <Text style={styles.termEmpty}>
            <Text style={{ color: theme.colors.termGreen }}>{'>_ '}</Text>
            <Text style={{ color: theme.colors.termDim }}>
              belum ada output — ketik perintah di bawah
            </Text>
          </Text>
        ) : (
          output.map((line, idx) => (
            <Text key={idx} style={styles.termLine}>
              {line}
            </Text>
          ))
        )}
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
        <NavIcon name={isDir ? 'SFTP' : 'File'} color={theme.colors.dim} />
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
  const tabs: Array<'Klien' | 'Tools' | 'SSH' | 'SFTP'> = [
    'Klien',
    'Tools',
    'SSH',
    'SFTP',
  ];

  return (
    <View style={styles.navBarWrapper}>
      <View style={styles.navBarContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const color = isActive ? theme.colors.accent : theme.colors.dim;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.navItem}
              onPress={() => onSelectTab(tab)}
              activeOpacity={0.7}
            >
              <NavIcon name={tab} color={color} />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color,
                  },
                ]}
              >
                {tab}
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
    minWidth: 0,
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    flexShrink: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: theme.sizes.micro,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.faint,
    flexShrink: 0,
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
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.accentDark,
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
    paddingVertical: theme.spacing.sm,
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
  termEmpty: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    lineHeight: 18,
  },
  extraKeyRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.termPanel,
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
    backgroundColor: theme.colors.termKey,
  },
  extraKeyText: {
    color: theme.colors.termText,
    fontFamily: theme.fonts.mono,
    fontSize: theme.sizes.xs,
  },
  termInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.termPanel,
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
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  fileRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
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
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
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
  },
  centerFabIcon: {
    fontSize: 28,
    color: theme.colors.white,
    lineHeight: 30,
    fontWeight: '300',
  },
});
