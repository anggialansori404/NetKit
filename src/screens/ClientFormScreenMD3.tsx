/**
 * NetKit MD3 - Client Form Screen
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  useTheme,
} from 'react-native-paper';
import { store } from '../storage/storage-sqlite';

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

  const handleSave = () => {
    if (!nama.trim() || !ip.trim()) return;
    const data = {
      namaBpr: nama.trim(),
      alamat: alamat.trim(),
      ipGateway: ip.trim(),
      port: parseInt(port, 10) || 22,
      ipVpn: ipVpn.trim(),
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
  save: { marginTop: 8 },
});
