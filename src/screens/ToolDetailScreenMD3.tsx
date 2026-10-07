/**
 * NetKit MD3 - Tool Detail Screen (riwayat)
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Text, Card, useTheme } from 'react-native-paper';
import { store } from '../storage/storage';

export function ToolDetailScreenMD3({ navigation, route }: any) {
  const theme = useTheme();
  const { runId } = route.params;
  const run = store.getToolRuns().find((r) => r.id === runId);

  if (!run) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Tidak ditemukan" />
        </Appbar.Header>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`${run.tool} · ${run.timestamp}`} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.mono} selectable>
              {run.ringkasan}
            </Text>
            {run.output ? (
              <Text variant="bodySmall" style={[styles.mono, styles.output]} selectable>
                {run.output}
              </Text>
            ) : null}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  mono: { fontFamily: 'monospace' },
  output: { marginTop: 12, opacity: 0.8 },
});
