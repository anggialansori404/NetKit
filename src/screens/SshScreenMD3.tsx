/**
 * NetKit MD3 - SSH Screen
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Appbar,
  List,
  Divider,
  Button,
  Text,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { store } from '../storage/storage';

export function SshScreenMD3({ navigation }: any) {
  const theme = useTheme();
  const [sessions, setSessions] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSessions(store.getSessions());
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false}>
        <Appbar.Content title="SSH" subtitle={`${sessions.length} sesi · full pty`} />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="labelLarge" style={styles.sectionTitle}>
          DAFTAR SESI TERSIMPAN
        </Text>
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <>
              <List.Item
                title={item.nama}
                description={`${item.user}@${item.host}:${item.port}`}
                descriptionStyle={styles.mono}
                right={() => <List.Icon icon="chevron-right" />}
                onPress={() => navigation.navigate('ToolRunner', { tool: 'SSH', sessionId: item.id })}
                style={styles.item}
              />
              <Divider />
            </>
          )}
          ListEmptyComponent={
            <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.secondary }]}>
              Belum ada sesi SSH tersimpan.
            </Text>
          }
        />
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => {}}
          style={styles.addButton}
        >
          Tambah Sesi SSH Baru
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 12, paddingBottom: 96 },
  sectionTitle: { marginVertical: 8, opacity: 0.7 },
  item: { paddingVertical: 2 },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  empty: { padding: 16 },
  addButton: { marginTop: 12 },
});
