/**
 * NetKit MD3 - Tools Screen
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  Text,
  Card,
  List,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { store, ToolRun } from '../storage/storage-sqlite';

const TOOLS = [
  { key: 'PING', title: 'PING', desc: 'ip/hostname custom', icon: 'pulse' },
  { key: 'TELNET', title: 'TELNET', desc: 'tcp host:port', icon: 'console-network' },
  { key: 'DNS', title: 'DNS', desc: 'lookup & reverse', icon: 'dns' },
  { key: 'HTTP/SSL', title: 'HTTP/SSL', desc: 'status + sertifikat', icon: 'lock' },
] as const;

export function ToolsScreenMD3({ navigation }: any) {
  const theme = useTheme();
  const [runs, setRuns] = useState<ToolRun[]>([]);

  useFocusEffect(
    useCallback(() => {
      setRuns(store.getToolRuns());
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false}>
        <Appbar.Content title="Tools" subtitle={`${TOOLS.length} instrumen · ${runs.length} riwayat`} />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          INSTRUMEN DIAGNOSTIK
        </Text>
        <View style={styles.grid}>
          {TOOLS.map((t) => (
            <Card
              key={t.key}
              mode="elevated"
              style={styles.card}
              onPress={() => navigation.navigate('ToolRunner', { tool: t.key })}
            >
              <Card.Content style={styles.cardContent}>
                {/* M3 secondaryContainer icon box */}
                <View style={[styles.iconBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                  <List.Icon
                    icon={t.icon}
                    color={theme.colors.onSecondaryContainer}
                  />
                </View>
                <Text variant="titleSmall" style={styles.cardTitle}>{t.title}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t.desc}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          TERAKHIR
        </Text>
        {runs.length === 0 ? (
          <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
            Belum ada riwayat diagnostik.
          </Text>
        ) : (
          <Card mode="contained" style={styles.historyCard}>
            {runs.slice(0, 10).map((run, i) => (
              <View key={run.id}>
                <List.Item
                  title={run.timestamp}
                  description={run.ringkasan}
                  descriptionNumberOfLines={1}
                  left={() => (
                    <Text
                      variant="labelSmall"
                      style={[styles.toolBadge, { color: theme.colors.primary }]}
                    >
                      {run.tool}
                    </Text>
                  )}
                  right={() => <List.Icon icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
                  onPress={() => navigation.navigate('ToolDetail', { runId: run.id })}
                  style={styles.historyItem}
                />
                {i < Math.min(runs.length, 10) - 1 && (
                  <Divider bold style={{ backgroundColor: theme.colors.outlineVariant }} />
                )}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 96 },
  sectionTitle: { marginVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  card: { flex: 1, minWidth: '47%' },
  cardContent: { alignItems: 'flex-start', paddingVertical: 12, gap: 8 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardTitle: { marginTop: 4 },
  historyCard: { marginBottom: 8 },
  historyItem: { paddingVertical: 2 },
  toolBadge: { fontWeight: '700', alignSelf: 'center', marginLeft: 8 },
  empty: { padding: 16 },
});
