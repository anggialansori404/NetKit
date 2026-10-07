/**
 * NetKit MD3 - Client Form Screen
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import { store } from '../storage/storage-sqlite';
import { isPrivateIp } from '../engine/network';

export function ClientFormScreenMD3({ navigation, route }: any) {
  const theme = useTheme();
  const { clientId } = route.params || {};
  const existing = clientId ? store.getClients().find((c) => c.id === clientId) : undefined;

  const [nama, setNama] = useState(existing?.namaBpr || '');
  const [alamat, setAlamat] = useState(existing?.alamat || '');
  const [ip, setIp] = useState(existing?.ipGateway || '');
  const [port, setPort] = useState(existing ? String(existing.port) : '22');
  const [ipVpn, setIpVpn] = useState(existing?.ipVpn || '');
  const [catatan, setCatatan] = useState(existing?.catatan || '');
  // ipJenis: manual override, '' = auto-detect
  const [ipJenis, setIpJenis] = useState<'lokal' | 'publik' | ''>(
    existing?.ipJenis || ''
  );

  const handleSave = () => {
    if (!nama.trim() || !ip.trim()) return;
    const data = {
      namaBpr: nama.trim(),
      alamat: alamat.trim(),
      ipGateway: ip.trim(),
      port: parseInt(port, 10) || 22,
      ipVpn: ipVpn.trim(),
      ipJenis: ipJenis || undefined,
      catatan: catatan.trim(),
    };
    if (existing) {
      store.saveClient({ ...existing, ...data });
    } else {
      store.saveClient(data);
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={existing ? 'Edit Klien' : 'Tambah Klien'} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Nama BPR"
          value={nama}
          onChangeText={setNama}
          mode="outlined"
          dense
          style={styles.input}
        />
        <TextInput
          label="Alamat"
          value={alamat}
          onChangeText={setAlamat}
          mode="outlined"
          dense
          style={styles.input}
        />
        <TextInput
          label="IP Gateway"
          value={ip}
          onChangeText={setIp}
          mode="outlined"
          dense
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          label="Port"
          value={port}
          onChangeText={setPort}
          mode="outlined"
          dense
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          label="IP VPN (opsional)"
          value={ipVpn}
          onChangeText={setIpVpn}
          mode="outlined"
          dense
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>
          Jenis IP Gateway
        </Text>
        <SegmentedButtons
          value={ipJenis}
          onValueChange={(v) => setIpJenis(v as 'lokal' | 'publik' | '')}
          buttons={[
            { value: '', label: 'Otomatis' },
            { value: 'lokal', label: 'Lokal' },
            { value: 'publik', label: 'Publik' },
          ]}
          style={styles.input}
        />
        {ip.trim() ? (
          <Text variant="bodySmall" style={styles.hint}>
            Terdeteksi: {isPrivateIp(ip.trim()) ? 'lokal' : 'publik'}
            {ipJenis ? ` · dipakai: ${ipJenis}` : ' · dipakai: otomatis'}
          </Text>
        ) : null}

        <TextInput
          label="Catatan (opsional)"
          value={catatan}
          onChangeText={setCatatan}
          mode="outlined"
          dense
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleSave} style={styles.save}>
          Simpan
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  input: { marginBottom: 12 },
  label: { marginBottom: 8, opacity: 0.7 },
  hint: { marginTop: -8, marginBottom: 12, opacity: 0.6 },
  save: { marginTop: 8 },
});
