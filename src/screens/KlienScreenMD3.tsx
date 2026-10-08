/**
 * NetKit MD3 - Klien Screen (Direktori Klien)
 * Material Design 3, compact density.
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Appbar,
  Searchbar,
  Chip,
  Card,
  Avatar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { store, Client } from '../storage/storage-sqlite';
import { isPrivateIp } from '../engine/network';

type Filter = 'semua' | 'lokal' | 'publik';

export function KlienScreenMD3({ navigation }: any) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState({ total: 0, lokal: 0, publik: 0 });
  const [filter, setFilter] = useState<Filter>('semua');

  useFocusEffect(
    useCallback(() => {
      setClients(store.getClients());
      setStats(store.getClientStats());
    }, [])
  );

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.namaBpr.toLowerCase().includes(q) ||
      c.ipGateway.toLowerCase().includes(q) ||
      c.alamat.toLowerCase().includes(q);
    if (!matchSearch) return false;
    const lokal = c.ipJenis ? c.ipJenis === 'lokal' : isPrivateIp(c.ipGateway);
    if (filter === 'lokal') return lokal;
    if (filter === 'publik') return !lokal;
    return true;
  });

  const monogram = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false}>
        <Appbar.Content
          title="NetKit"
          subtitle={`${stats.total} klien · ${stats.lokal} lokal · ${stats.publik} publik`}
        />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      {/* M3 pill SearchBar — borderRadius 28, height 56, surfaceContainerHigh bg */}
      <Searchbar
        placeholder="Cari BPR / IP"
        value={search}
        onChangeText={setSearch}
        style={[
          styles.search,
          { backgroundColor: theme.colors.elevation.level3, borderRadius: 28 },
        ]}
        inputStyle={styles.searchInput}
        elevation={0}
      />

      {/* M3 Filter Chips */}
      <View style={styles.chips}>
        {(['semua', 'lokal', 'publik'] as Filter[]).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={styles.chip}
            showSelectedOverlay
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const lokal = item.ipJenis ? item.ipJenis === 'lokal' : isPrivateIp(item.ipGateway);
          return (
            <Card
              mode="outlined"
              style={styles.card}
              onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
            >
              <Card.Title
                title={item.namaBpr}
                titleVariant="titleMedium"
                subtitle={item.alamat}
                subtitleVariant="bodyMedium"
                subtitleNumberOfLines={1}
                left={() => (
                  <Avatar.Text
                    size={40}
                    label={monogram(item.namaBpr)}
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                    color={theme.colors.onPrimaryContainer}
                  />
                )}
                right={() => (
                  <Chip
                    compact
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: lokal
                          ? theme.colors.secondaryContainer
                          : theme.colors.tertiaryContainer,
                      },
                    ]}
                    textStyle={{
                      color: lokal
                        ? theme.colors.onSecondaryContainer
                        : theme.colors.onTertiaryContainer,
                    }}
                  >
                    {lokal ? 'lokal' : 'publik'}
                  </Chip>
                )}
              />
              <Card.Content style={styles.cardContent}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.ipGateway}:{item.port}
                </Text>
              </Card.Content>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Avatar.Icon
              size={56}
              icon={search || filter !== 'semua' ? 'magnify-close' : 'bank-outline'}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="titleMedium"
              style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
            >
              {search || filter !== 'semua' ? 'Tidak ada hasil' : 'Belum ada klien'}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
            >
              {search || filter !== 'semua'
                ? 'Coba ubah kata kunci atau filter.'
                : 'Ketuk tombol + di bawah untuk tambah klien pertama.'}
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
  search: { marginHorizontal: 16, marginTop: 8, marginBottom: 4, height: 56 },
  searchInput: { fontSize: 14 },
  chips: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { marginRight: 0 },
  listContent: { padding: 12, paddingBottom: 96, gap: 8 },
  card: { marginHorizontal: 0 },
  cardContent: { paddingTop: 0, paddingBottom: 12 },
  statusChip: { marginRight: 8, alignSelf: 'center' },
  empty: { padding: 40, alignItems: 'center', gap: 12 },
  emptyTitle: { marginTop: 4 },
});
