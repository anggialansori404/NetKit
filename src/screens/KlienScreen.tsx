/**
 * NetKit - Klien Screen (Direktori Klien)
 * Sesuai DESIGN.md §4.1 & Mockup 01-klien-light-v7.png
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { theme } from '../ui/theme';
import {
  InstrumentHeader,
  TerminalSearch,
  ClientRow,
} from '../ui/components';
import { store, Client } from '../storage/storage';
import { isPrivateIp } from '../engine/network';

interface KlienScreenProps {
  onSelectClient: (client: Client) => void;
  onOpenSettings: () => void;
}

export const KlienScreen: React.FC<KlienScreenProps> = ({
  onSelectClient,
  onOpenSettings,
}) => {
  const [search, setSearch] = useState('');
  const clients = store.getClients();
  const stats = store.getClientStats();

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.namaBpr.toLowerCase().includes(q) ||
      c.ipGateway.toLowerCase().includes(q) ||
      c.alamat.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      <InstrumentHeader
        wordmark="NETKIT"
        stats={[
          { label: 'KLIEN', value: stats.total, color: theme.colors.text },
          { label: 'LOKAL', value: stats.lokal, color: theme.colors.dim },
          { label: 'PUBLIK', value: stats.publik, color: theme.colors.accent },
        ]}
        onGearPress={onOpenSettings}
        showGear
      />

      <TerminalSearch
        value={search}
        onChangeText={setSearch}
        placeholder="cari bpr / ip_"
      />

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClientRow
            namaBpr={item.namaBpr}
            alamat={item.alamat}
            ipGateway={item.ipGateway}
            port={item.port}
            isLokal={isPrivateIp(item.ipGateway)}
            onPress={() => onSelectClient(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada data klien yang cocok.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.sizes.sm,
    color: theme.colors.dim,
    fontFamily: theme.fonts.sans,
  },
});
