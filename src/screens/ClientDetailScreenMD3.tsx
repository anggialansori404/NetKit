/**
 * NetKit MD3 - Client Detail Screen
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  List,
  Divider,
  Button,
  Text,
  useTheme,
} from 'react-native-paper';
import { store } from '../storage/storage-sqlite';
import { isPrivateIp } from '../engine/network';

export function ClientDetailScreenMD3({ navigation, route }: any) {
  const theme = useTheme();
  const { clientId } = route.params;
  const client = store.getClients().find((c) => c.id === clientId);

  if (!client) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Klien tidak ditemukan" />
        </Appbar.Header>
      </View>
    );
  }

  const lokal = client.ipJenis ? client.ipJenis === 'lokal' : isPrivateIp(client.ipGateway);

  const rows = [
    { label: 'Nama BPR', value: client.namaBpr },
    { label: 'Alamat', value: client.alamat },
    { label: 'IP Gateway', value: `${client.ipGateway} · ${lokal ? 'lokal' : 'publik'}` },
    { label: 'Port', value: String(client.port) },
    { label: 'IP VPN', value: client.ipVpn || '—' },
    { label: 'Catatan', value: client.catatan || '—' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={client.namaBpr} />
        <Appbar.Action
          icon="pencil"
          onPress={() => navigation.navigate('ClientForm', { clientId: client.id })}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {rows.map((r, i) => (
          <View key={r.label}>
            <List.Item
              title={r.label}
              titleStyle={styles.label}
              description={r.value}
              descriptionStyle={undefined}
              descriptionNumberOfLines={2}
            />
            {i < rows.length - 1 && <Divider />}
          </View>
        ))}

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="console-network"
            onPress={() => navigation.navigate('ToolRunner', { tool: 'TELNET', target: `${client.ipGateway}:${client.port}` })}
            style={styles.button}
          >
            Cek Koneksi
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            textColor={theme.colors.error}
            onPress={() => {
              store.deleteClient(client.id);
              navigation.goBack();
            }}
            style={styles.button}
          >
            Hapus
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  label: { fontSize: 12, opacity: 0.6 },
  actions: { padding: 16, gap: 8 },
  button: { marginBottom: 4 },
});
