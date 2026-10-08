/**
 * NetKit MD3 - Client Detail Screen
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Share } from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  Button,
  Text,
  Divider,
  useTheme,
} from 'react-native-paper';
import { store } from '../storage/storage-sqlite';
import { isPrivateIp } from '../engine/network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ClientDetailScreenMD3({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
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

  const copyText = (text: string) => {
    Share.share({ message: text });
  };

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

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>

        {/* Identity Card */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
              IDENTITAS
            </Text>
            <Divider style={styles.divider} />
            <Row label="Nama BPR" value={client.namaBpr} theme={theme} />
            <Divider style={styles.rowDivider} />
            <Row label="Alamat" value={client.alamat} theme={theme} />
          </Card.Content>
        </Card>

        {/* Connection Specs Card */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
              KONEKSI
            </Text>
            <Divider style={styles.divider} />
            <Row
              label="IP Gateway"
              value={`${client.ipGateway} · ${lokal ? 'lokal' : 'publik'}`}
              theme={theme}
            />
            <Divider style={styles.rowDivider} />
            <Row label="Port" value={String(client.port)} theme={theme} />
            <Divider style={styles.rowDivider} />
            <Row label="IP VPN" value={client.ipVpn || '—'} theme={theme} />
          </Card.Content>
        </Card>

        {/* Notes Card — only if has content */}
        {client.catatan ? (
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                CATATAN
              </Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {client.catatan}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        {/* M3 Assist Chips — quick copy */}
        <Card style={styles.card} mode="contained">
          <Card.Content>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              SALIN CEPAT
            </Text>
            <View style={styles.chipRow}>
              <Chip
                icon="content-copy"
                onPress={() => copyText(client.ipGateway)}
                style={styles.assistChip}
              >
                IP Gateway
              </Chip>
              <Chip
                icon="content-copy"
                onPress={() => copyText(String(client.port))}
                style={styles.assistChip}
              >
                Port
              </Chip>
              {client.ipVpn ? (
                <Chip
                  icon="content-copy"
                  onPress={() => copyText(client.ipVpn)}
                  style={styles.assistChip}
                >
                  IP VPN
                </Chip>
              ) : null}
              <Chip
                icon="content-copy"
                onPress={() =>
                  copyText(`${client.ipGateway}:${client.port}`)
                }
                style={styles.assistChip}
              >
                IP:Port
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="console-network"
            onPress={() =>
              navigation.navigate('ToolRunner', {
                tool: 'TELNET',
                target: `${client.ipGateway}:${client.port}`,
              })
            }
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
          >
            Hapus
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

/** Single labeled row inside a card */
function Row({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={rowStyles.row}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
        {value}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { paddingVertical: 8 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  card: { marginHorizontal: 0 },
  divider: { marginVertical: 8 },
  rowDivider: { marginVertical: 0 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  assistChip: {},
  actions: { gap: 8, marginTop: 4 },
});
