/**
 * NetKit MD3 - Pengaturan Screen
 * Strict MD3: grouped List sections with proper dividers.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  List,
  Divider,
  useTheme,
} from 'react-native-paper';

export function PengaturanScreenMD3({ navigation }: any) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Pengaturan" />
      </Appbar.Header>

      <ScrollView style={styles.scroll}>
        <List.Section>
          <List.Subheader>Tampilan</List.Subheader>
          <List.Item
            title="Tema"
            description="Terang"
            left={(props) => <List.Icon {...props} icon="palette-outline" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Skema Warna"
            description="Material Design 3 baseline"
            left={(props) => <List.Icon {...props} icon="format-color-fill" />}
            onPress={() => {}}
          />
        </List.Section>

        <Divider style={styles.sectionDivider} />

        <List.Section>
          <List.Subheader>Data</List.Subheader>
          <List.Item
            title="Penyimpanan"
            description="SQLite lokal · offline-first"
            left={(props) => <List.Icon {...props} icon="database-outline" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Kredensial"
            description="Tersimpan di Keychain / Keystore"
            left={(props) => <List.Icon {...props} icon="lock-outline" />}
            onPress={() => {}}
          />
        </List.Section>

        <Divider style={styles.sectionDivider} />

        <List.Section>
          <List.Subheader>Tentang</List.Subheader>
          <List.Item
            title="NetKit"
            description="v8 · toolkit diagnostik network"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Material Design 3"
            description="Baseline m3.material.io"
            left={(props) => <List.Icon {...props} icon="material-design" />}
            onPress={() => {}}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  sectionDivider: { height: 8, backgroundColor: 'transparent' },
});
