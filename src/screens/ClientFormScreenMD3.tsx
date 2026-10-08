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
  HelperText,
  useTheme,
} from 'react-native-paper';
import { store } from '../storage/storage-sqlite';
import { isPrivateIp } from '../engine/network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ClientFormScreenMD3({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
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
  const [submitted, setSubmitted] = useState(false);

  const namaError = submitted && !nama.trim();
  const ipError = submitted && !ip.trim();

  const handleSave = () => {
    setSubmitted(true);
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

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>

        <TextInput
          label="Nama BPR *"
          value={nama}
          onChangeText={setNama}
          mode="outlined"
          style={styles.input}
          error={namaError}
        />
        <HelperText type={namaError ? 'error' : 'info'} visible>
          {namaError ? 'Nama BPR wajib diisi.' : 'Contoh: BPR Artha Prima'}
        </HelperText>

        <TextInput
          label="Alamat"
          value={alamat}
          onChangeText={setAlamat}
          mode="outlined"
          style={styles.input}
        />
        <HelperText type="info" visible>
          Alamat kantor lembaga.
        </HelperText>

        <TextInput
          label="IP Gateway *"
          value={ip}
          onChangeText={setIp}
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="decimal-pad"
          style={styles.input}
          error={ipError}
        />
        <HelperText type={ipError ? 'error' : 'info'} visible>
          {ipError ? 'IP Gateway wajib diisi.' : 'Contoh: 192.168.1.1 atau 103.xxx.xxx.xxx'}
        </HelperText>

        <TextInput
          label="Port"
          value={port}
          onChangeText={setPort}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />
        <HelperText type="info" visible>
          Port default: 22 (SSH) atau 8080.
        </HelperText>

        <TextInput
          label="IP VPN (opsional)"
          value={ipVpn}
          onChangeText={setIpVpn}
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <HelperText type="info" visible>
          IP lokal lembaga lewat VPN, jika ada.
        </HelperText>

        <Text variant="labelLarge" style={styles.sectionLabel}>
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
          <HelperText type="info" visible>
            Terdeteksi: {isPrivateIp(ip.trim()) ? 'lokal' : 'publik'}
            {ipJenis ? ` · dipakai: ${ipJenis}` : ' · dipakai: otomatis'}
          </HelperText>
        ) : null}

        <TextInput
          label="Catatan (opsional)"
          value={catatan}
          onChangeText={setCatatan}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <HelperText type="info" visible>
          Contoh: PIC Pak Dedi 0812-xxx-xxxx
        </HelperText>

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
  input: { marginBottom: 0 },
  sectionLabel: { marginBottom: 8, marginTop: 4, opacity: 0.7 },
  save: { marginTop: 16 },
});
