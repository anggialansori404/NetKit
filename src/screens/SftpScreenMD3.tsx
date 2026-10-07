/**
 * NetKit MD3 - SFTP Screen
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Appbar,
  List,
  Divider,
  Text,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { store } from '../storage/storage';

export function SftpScreenMD3({ navigation }: any) {
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
        <Appbar.Content title="SFTP" subtitle={`${sessions.length} sesi · subsystem`} />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="labelLarge" style={styles.sectionTitle}>
          PILIH SESI SERVER
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
                left={() => <List.Icon icon="folder" />}
                right={() => <List.Icon icon="chevron-right" />}
                onPress={() => {}}
                style={styles.item}
              />
              <Divider />
            </>
          )}
          ListEmptyComponent={
            <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.secondary }]}>
              Belum ada sesi. Tambah sesi SSH dulu.
            </Text>
          }
        />
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
});
