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
        <Text variant="labelLarge" style={styles.sectionTitle}>
          INSTRUMEN DIAGNOSTIK
        </Text>
        <View style={styles.grid}>
          {TOOLS.map((t) => (
            <Card
              key={t.key}
              style={styles.card}
              onPress={() => navigation.navigate('ToolRunner', { tool: t.key })}
            >
              <Card.Content style={styles.cardContent}>
                <List.Icon icon={t.icon} />
                <Text variant="titleSmall" >{t.title}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                  {t.desc}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Text variant="labelLarge" style={styles.sectionTitle}>
          TERAKHIR
        </Text>
        {runs.length === 0 ? (
          <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.secondary }]}>
            Belum ada riwayat diagnostik.
          </Text>
        ) : (
          <Card style={styles.historyCard}>
            {runs.slice(0, 10).map((run, i) => (
              <View key={run.id}>
                <List.Item
                  title={`${run.timestamp}`}
                  titleStyle={undefined}
                  description={run.ringkasan}
                  descriptionNumberOfLines={1}
                  left={() => (
                    <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '700', alignSelf: 'center', marginLeft: 8 }}>
                      {run.tool}
                    </Text>
                  )}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() => navigation.navigate('ToolDetail', { runId: run.id })}
                  style={styles.historyItem}
                />
                {i < Math.min(runs.length, 10) - 1 && <Divider />}
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
  sectionTitle: { marginVertical: 8, opacity: 0.7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  card: { flex: 1, minWidth: '47%' },
  cardContent: { alignItems: 'flex-start', paddingVertical: 12 },
  historyCard: { marginBottom: 8 },
  historyItem: { paddingVertical: 2 },
  empty: { padding: 16 },
});
