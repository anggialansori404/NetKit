/**
 * NetKit - ClientFormScreen (Tambah / Edit Klien)
 * Sesuai DESIGN.md §4.3 & Acceptance Criteria §9
 * Validasi menolak IP ngawur & port invalid dengan pesan inline.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { theme } from '../ui/theme.js';
import { InstrumentHeader, ChunkyButton } from '../ui/components.js';
import { Client, store } from '../storage/storage.js';
import {
  isValidIpv4,
  isValidPort,
  isPrivateIp,
} from '../engine/network.js';

interface ClientFormScreenProps {
  initialClient?: Client | null;
  onSaved: (client: Client) => void;
  onCancel: () => void;
}

export const ClientFormScreen: React.FC<ClientFormScreenProps> = ({
  initialClient,
  onSaved,
  onCancel,
}) => {
  const [namaBpr, setNamaBpr] = useState(initialClient?.namaBpr || '');
  const [alamat, setAlamat] = useState(initialClient?.alamat || '');
  const [ipGateway, setIpGateway] = useState(initialClient?.ipGateway || '');
  const [port, setPort] = useState(
    initialClient?.port !== undefined ? String(initialClient.port) : '8080'
  );
  const [ipVpn, setIpVpn] = useState(initialClient?.ipVpn || '');
  const [catatan, setCatatan] = useState(initialClient?.catatan || '');

  // Errors inline
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isGatewayLokal = ipGateway.trim() ? isPrivateIp(ipGateway.trim()) : null;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!namaBpr.trim()) {
      errs.namaBpr = 'Nama BPR wajib diisi.';
    }
    if (!alamat.trim()) {
      errs.alamat = 'Alamat wajib diisi.';
    }
    if (!ipGateway.trim()) {
      errs.ipGateway = 'IP Gateway wajib diisi.';
    } else if (!isValidIpv4(ipGateway.trim())) {
      errs.ipGateway = 'Format IPv4 tidak valid (harus 0.0.0.0 - 255.255.255.255).';
    }
    if (!port.trim()) {
      errs.port = 'Port wajib diisi.';
    } else if (!isValidPort(port.trim())) {
      errs.port = 'Port tidak valid (harus angka 1 - 65535).';
    }
    if (!ipVpn.trim()) {
      errs.ipVpn = 'IP VPN wajib diisi.';
    } else if (!isValidIpv4(ipVpn.trim())) {
      errs.ipVpn = 'Format IPv4 VPN tidak valid.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const saved = store.saveClient({
      ...(initialClient ? { id: initialClient.id } : {}),
      namaBpr: namaBpr.trim(),
      alamat: alamat.trim(),
      ipGateway: ipGateway.trim(),
      port: parseInt(port.trim(), 10),
      ipVpn: ipVpn.trim(),
      catatan: catatan.trim() || undefined,
    });

    onSaved(saved);
  };

  return (
    <View style={styles.container}>
      <InstrumentHeader
        wordmark={initialClient ? 'EDIT KLIEN' : 'TAMBAH KLIEN'}
        stats={
          isGatewayLokal !== null
            ? [
                {
                  label: 'TIPE IP',
                  value: isGatewayLokal ? 'LOKAL' : 'PUBLIK',
                  color: isGatewayLokal
                    ? theme.colors.dim
                    : theme.colors.accent,
                },
              ]
            : []
        }
        showGear={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Nama BPR */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>NAMA BPR *</Text>
          <TextInput
            style={[styles.input, errors.namaBpr && styles.inputError]}
            value={namaBpr}
            onChangeText={(t) => {
              setNamaBpr(t);
              if (errors.namaBpr) setErrors({ ...errors, namaBpr: '' });
            }}
            placeholder="mis. BPR Artha Prima"
            placeholderTextColor={theme.colors.faint}
          />
          {errors.namaBpr && (
            <Text style={styles.errorText}>{errors.namaBpr}</Text>
          )}
        </View>

        {/* Alamat */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ALAMAT *</Text>
          <TextInput
            style={[styles.input, errors.alamat && styles.inputError]}
            value={alamat}
            onChangeText={(t) => {
              setAlamat(t);
              if (errors.alamat) setErrors({ ...errors, alamat: '' });
            }}
            placeholder="Jl. Merdeka No. 88, Bandung"
            placeholderTextColor={theme.colors.faint}
          />
          {errors.alamat && (
            <Text style={styles.errorText}>{errors.alamat}</Text>
          )}
        </View>

        {/* IP Gateway */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>IP GATEWAY (MINI PC) *</Text>
            {isGatewayLokal !== null && (
              <Text
                style={[
                  styles.tagBadge,
                  {
                    color: isGatewayLokal
                      ? theme.colors.dim
                      : theme.colors.accent,
                  },
                ]}
              >
                ·{isGatewayLokal ? 'lokal' : 'publik'}
              </Text>
            )}
          </View>
          <TextInput
            style={[
              styles.input,
              styles.monoInput,
              errors.ipGateway && styles.inputError,
            ]}
            value={ipGateway}
            onChangeText={(t) => {
              setIpGateway(t);
              if (errors.ipGateway) setErrors({ ...errors, ipGateway: '' });
            }}
            placeholder="192.168.10.5 atau 103.147.8.20"
            placeholderTextColor={theme.colors.faint}
            keyboardType="numeric"
            autoCapitalize="none"
          />
          {errors.ipGateway && (
            <Text style={styles.errorText}>{errors.ipGateway}</Text>
          )}
        </View>

        {/* Port */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PORT (DEFAULT 8080) *</Text>
          <TextInput
            style={[
              styles.input,
              styles.monoInput,
              errors.port && styles.inputError,
            ]}
            value={port}
            onChangeText={(t) => {
              setPort(t);
              if (errors.port) setErrors({ ...errors, port: '' });
            }}
            placeholder="8080"
            placeholderTextColor={theme.colors.faint}
            keyboardType="numeric"
          />
          {errors.port && <Text style={styles.errorText}>{errors.port}</Text>}
        </View>

        {/* IP VPN */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>IP VPN (CATATAN SAJA) *</Text>
          <TextInput
            style={[
              styles.input,
              styles.monoInput,
              errors.ipVpn && styles.inputError,
            ]}
            value={ipVpn}
            onChangeText={(t) => {
              setIpVpn(t);
              if (errors.ipVpn) setErrors({ ...errors, ipVpn: '' });
            }}
            placeholder="10.254.1.20"
            placeholderTextColor={theme.colors.faint}
            keyboardType="numeric"
            autoCapitalize="none"
          />
          {errors.ipVpn && <Text style={styles.errorText}>{errors.ipVpn}</Text>}
        </View>

        {/* Catatan */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>CATATAN (OPSIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={catatan}
            onChangeText={setCatatan}
            placeholder="PIC: Pak Dedi 0812-..., server lokal..."
            placeholderTextColor={theme.colors.faint}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <ChunkyButton
            title="SIMPAN DATA"
            onPress={handleSave}
            style={styles.saveBtn}
          />
          <ChunkyButton
            title="BATAL"
            variant="outline"
            onPress={onCancel}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: theme.spacing.margin,
    paddingBottom: 60,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: theme.sizes.micro,
    color: theme.colors.dim,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagBadge: {
    fontSize: theme.sizes.micro,
    fontFamily: theme.fonts.mono,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.panel,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize: theme.sizes.base,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
  },
  monoInput: {
    fontFamily: theme.fonts.mono,
  },
  inputError: {
    borderColor: theme.colors.fail,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: theme.sizes.xs,
    color: theme.colors.fail,
    marginTop: 4,
    fontFamily: theme.fonts.sans,
  },
  actionRow: {
    marginTop: theme.spacing.lg,
    gap: 10,
  },
  saveBtn: {
    width: '100%',
  },
  cancelBtn: {
    width: '100%',
  },
});
