/**
 * NetKit MD3 - SFTP Screen
 * Outlined Cards with leading Avatar, titleMedium session name, delete action.
 */

import React, { useState, useCallback, startTransition } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import {
  Appbar,
  Card,
  Avatar,
  Text,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { store, SshSession } from '../storage/storage-sqlite';

export function SftpScreenMD3({ navigation }: any) {
  const theme = useTheme();
  const [sessions, setSessions] = useState<SshSession[]>(() => store.getSessions());

  const load = useCallback(() => {
    const raf = requestAnimationFrame(() => {
      startTransition(() => {
        setSessions(store.getSessions());
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useFocusEffect(load);

  const handleDelete = (s: SshSession) => {
    Alert.alert(
      'Hapus Sesi',
      `Hapus sesi "${s.nama}"?`,
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
        <Appbar.Content title="SFTP" subtitle={`${sessions.length} sesi`} />
      </Appbar.Header>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <Card
            mode="outlined"
            style={styles.card}
            onPress={() => {}}
          >
            <Card.Title
              title={item.nama}
              titleVariant="titleMedium"
              subtitle={`${item.username}@${item.host}:${item.port}`}
              left={(props) => (
                <Avatar.Icon
                  {...props}
                  icon="server-network"
                  style={{ backgroundColor: theme.colors.tertiaryContainer }}
                  color={theme.colors.onTertiaryContainer}
                />
              )}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="delete-outline"
                  iconColor={theme.colors.error}
                  onPress={() => handleDelete(item)}
                />
              )}
            />
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Belum ada sesi. Tambah sesi SSH dulu.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 12, paddingBottom: 96 },
  card: {},
  separator: { height: 8 },
  empty: { padding: 32, alignItems: 'center' },
});
