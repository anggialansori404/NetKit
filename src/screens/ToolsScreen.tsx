/**
 * NetKit - ToolsScreen (Hub Tools Diagnostik)
 * Sesuai DESIGN.md §4.4 & Mockup 02-tools-light-v7.png
 * Grid 2x2: PING, TELNET, DNS, HTTP/SSL.
 * Section TERAKHIR: riwayat tool (timestamp • tool • ringkasan).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../ui/theme';
import { InstrumentHeader, ToolCard } from '../ui/components';
import { store, ToolRun } from '../storage/storage';

interface ToolsScreenProps {
  onSelectTool: (tool: 'PING' | 'TELNET' | 'DNS' | 'HTTP/SSL') => void;
  onSelectHistory: (run: ToolRun) => void;
  onOpenSettings: () => void;
}

export const ToolsScreen: React.FC<ToolsScreenProps> = ({
  onSelectTool,
  onSelectHistory,
  onOpenSettings,
}) => {
  const toolRuns = store.getToolRuns();

  return (
    <View style={styles.container}>
      <InstrumentHeader
        wordmark="TOOLS"
        stats={[
          { label: 'TOOLS', value: 4 },
          { label: 'MODE', value: 'OFFLINE' },
          { label: 'RIWAYAT', value: toolRuns.length },
        ]}
        onGearPress={onOpenSettings}
        showGear
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hub Tools Grid 2x2 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>INSTRUMEN DIAGNOSTIK</Text>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <ToolCard
                title="PING"
                subtitle="ip/hostname custom"
                onPress={() => onSelectTool('PING')}
              />
            </View>
            <View style={styles.gridCell}>
              <ToolCard
                title="TELNET"
                subtitle="tcp host:port"
                onPress={() => onSelectTool('TELNET')}
              />
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <ToolCard
                title="DNS"
                subtitle="lookup & reverse"
                onPress={() => onSelectTool('DNS')}
              />
            </View>
            <View style={styles.gridCell}>
              <ToolCard
                title="HTTP/SSL"
                subtitle="status + sertifikat"
                onPress={() => onSelectTool('HTTP/SSL')}
              />
            </View>
          </View>
        </View>

        {/* Section Terakhir (Riwayat Tool) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TERAKHIR</Text>
        </View>

        {toolRuns.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada riwayat diagnostik.</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {toolRuns.map((run) => (
              <TouchableOpacity
                key={run.id}
                style={styles.historyRow}
                onPress={() => onSelectHistory(run)}
                activeOpacity={0.7}
              >
                <View style={styles.historyLeft}>
                  <Text style={styles.historyTimestamp}>{run.timestamp}</Text>
                  <Text style={styles.historyToolTag}>{run.tool}</Text>
                </View>
                <Text style={styles.historySummary} numberOfLines={1}>
                  {run.ringkasan}
                </Text>
                <Text style={styles.historyArrow}>&gt;</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  gridContainer: {
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCell: {
    flex: 1,
  },
  historyList: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 130,
  },
  historyTimestamp: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.mono,
    color: theme.colors.dim,
  },
  historyToolTag: {
    fontSize: theme.sizes.micro,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    color: theme.colors.accent,
    backgroundColor: theme.colors.accentDim,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historySummary: {
    flex: 1,
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.mono,
    color: theme.colors.text,
  },
  historyArrow: {
    fontSize: theme.sizes.sm,
    color: theme.colors.faint,
    fontFamily: theme.fonts.mono,
    marginLeft: 6,
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  emptyText: {
    fontSize: theme.sizes.sm,
    color: theme.colors.dim,
    fontFamily: theme.fonts.sans,
  },
});
