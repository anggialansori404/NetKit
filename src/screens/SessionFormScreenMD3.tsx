/**
 * NetKit MD3 - SSH Session Form Screen (tambah/edit sesi)
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

export function SessionFormScreenMD3({ navigation, route }: any) {
  const theme = useTheme();
  const { sessionId } = route.params || {};
  const existing = sessionId
    ? store.getSessions().find((s) => s.id === sessionId)
    : undefined;

  const [nama, setNama] = useState(existing?.nama || '');
  const [host, setHost] = useState(existing?.host || '');
  const [port, setPort] = useState(existing ? String(existing.port) : '22');
  const [username, setUsername] = useState(existing?.username || '');
  const [auth, setAuth] = useState<'password' | 'key'>(existing?.auth || 'password');

  const handleSave = () => {
    if (!nama.trim() || !host.trim() || !username.trim()) return;
    const data = {
      nama: nama.trim(),
      host: host.trim(),
      port: parseInt(port, 10) || 22,
      username: username.trim(),
      auth,
      secretRef: existing?.secretRef || `sec_${Date.now()}`,
    };
    if (existing) {
      store.deleteSession(existing.id);
    }
    store.addSession(data);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={existing ? 'Edit Sesi SSH' : 'Tambah Sesi SSH'} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Nama Sesi"
          value={nama}
          onChangeText={setNama}
          mode="outlined"
          dense
          placeholder="gw-bpr"
          style={styles.input}
        />
        <TextInput
          label="Host / IP"
          value={host}
          onChangeText={setHost}
          mode="outlined"
          dense
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="103.147.8.20"
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
          label="Username"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          dense
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>
          Metode Auth
        </Text>
        <SegmentedButtons
          value={auth}
          onValueChange={(v) => setAuth(v as 'password' | 'key')}
          buttons={[
            { value: 'password', label: 'Password' },
            { value: 'key', label: 'SSH Key' },
          ]}
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
  save: { marginTop: 8 },
});
