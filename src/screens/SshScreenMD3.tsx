/**
 * NetKit MD3 - SSH Screen
 * Dengan hapus sesi (long-press / icon delete).
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import {
  Appbar,
  List,
  Divider,
  Button,
  Text,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { store, SshSession } from '../storage/storage-sqlite';

export function SshScreenMD3({ navigation }: any) {
  const theme = useTheme();
  const [sessions, setSessions] = useState<SshSession[]>([]);

  const load = useCallback(() => {
    setSessions(store.getSessions());
  }, []);

  useFocusEffect(load);

  const handleDelete = (s: SshSession) => {
    Alert.alert(
      'Hapus Sesi',
      `Hapus sesi "${s.nama}" (${s.username}@${s.host}:${s.port})?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            store.deleteSession(s.id);
            load();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="SSH" subtitle={`${sessions.length} sesi`} />
      </Appbar.Header>

      <View style={styles.content}>
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <>
              <List.Item
                title={item.nama}
                titleStyle={{ fontWeight: '600' }}
                description={`${item.username}@${item.host}:${item.port}`}
                onPress={() => navigation.navigate('SshTerminal', { sessionId: item.id })}
                right={() => (
                  <IconButton
                    icon="delete-outline"
                    iconColor={theme.colors.error}
                    size={22}
                    onPress={() => handleDelete(item)}
                  />
                )}
                style={styles.item}
              />
              <Divider />
            </>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Belum ada sesi SSH tersimpan.
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                Tambah sesi baru untuk mulai.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  item: { paddingVertical: 4 },
  empty: { padding: 32, alignItems: 'center' },
});
