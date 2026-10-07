/**
 * NetKit MD3 - Klien Screen (Direktori Klien)
 * Material Design 3, compact density.
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Appbar,
  Searchbar,
  List,
  Text,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { store, Client } from '../storage/storage-sqlite';
import { isPrivateIp } from '../engine/network';

export function KlienScreenMD3({ navigation }: any) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState({ total: 0, lokal: 0, publik: 0 });

  useFocusEffect(
    useCallback(() => {
      setClients(store.getClients());
      setStats(store.getClientStats());
    }, [])
  );

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.namaBpr.toLowerCase().includes(q) ||
      c.ipGateway.toLowerCase().includes(q) ||
      c.alamat.toLowerCase().includes(q)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false}>
        <Appbar.Content
          title="NetKit"
          subtitle={`${stats.total} klien · ${stats.lokal} lokal · ${stats.publik} publik`}
        />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      <Searchbar
        placeholder="Cari BPR / IP"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        inputStyle={styles.searchInput}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const lokal = item.ipJenis ? item.ipJenis === 'lokal' : isPrivateIp(item.ipGateway);
          return (
            <>
              <List.Item
                title={item.namaBpr}
                titleNumberOfLines={1}
                description={item.alamat}
                descriptionNumberOfLines={1}
                onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
                right={() => (
                  <View style={styles.rightMeta}>
                    <Text variant="bodyMedium" >
                      {item.ipGateway}:{item.port}
                    </Text>
                    <Text
                      variant="labelSmall"
                      style={{
                        color: lokal ? theme.colors.secondary : theme.colors.primary,
                      }}
                    >
                      {lokal ? '·lokal' : '·publik'}
                    </Text>
                  </View>
                )}
                style={styles.listItem}
              />
              <Divider />
            </>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
              {search ? 'Tidak ada klien yang cocok.' : 'Belum ada klien. Ketuk + untuk tambah.'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 12, marginBottom: 4, elevation: 0 },
  searchInput: { fontSize: 14 },
  listContent: { paddingBottom: 96 },
  listItem: { paddingVertical: 4, paddingHorizontal: 8 },
  rightMeta: { alignItems: 'flex-end', justifyContent: 'center' },
  empty: { padding: 24, alignItems: 'center' },
});
