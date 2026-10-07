/**
 * NetKit MD3 - Pengaturan Screen
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  List,
  Divider,
  Text,
  useTheme,
} from 'react-native-paper';

export function PengaturanScreenMD3({ navigation }: any) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Pengaturan" />
      </Appbar.Header>

      <ScrollView>
        <Text variant="labelLarge" style={styles.section}>
          UMUM
        </Text>
        <List.Item
          title="Tema"
          description="Terang (Material 3)"
          left={() => <List.Icon icon="palette" />}
        />
        <Divider />
        <List.Item
          title="Kepadatan UI"
          description="Compact"
          left={() => <List.Icon icon="density" />}
        />
        <Divider />

        <Text variant="labelLarge" style={styles.section}>
          TENTANG
        </Text>
        <List.Item
          title="NetKit"
          description="v7 · toolkit diagnostik network"
          left={() => <List.Icon icon="information" />}
        />
        <Divider />
        <List.Item
          title="Kredensial"
          description="Tersimpan di Keychain / Keystore"
          left={() => <List.Icon icon="lock" />}
        />
        <Divider />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 4, opacity: 0.7 },
});
