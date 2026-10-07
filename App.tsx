/**
 * NetKit v7 - Main Application Entry
 * Mobile technician toolkit for DFS Support
 */

import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { theme } from './src/ui/theme.js';
import { WavyNavBar } from './src/ui/components.js';
import { store, Client, ToolRun } from './src/storage/storage.js';
import { KlienScreen } from './src/screens/KlienScreen.js';
import { ClientDetailScreen } from './src/screens/ClientDetailScreen.js';
import { ClientFormScreen } from './src/screens/ClientFormScreen.js';
import { ToolsScreen } from './src/screens/ToolsScreen.js';
import { ToolDetailScreen } from './src/screens/ToolDetailScreen.js';
import { SshScreen } from './src/screens/SshScreen.js';
import { SftpScreen } from './src/screens/SftpScreen.js';
import { PengaturanScreen } from './src/screens/PengaturanScreen.js';

type Tab = 'Klien' | 'Tools' | 'SSH' | 'SFTP';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Klien');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null | 'new'>(null);
  const [selectedTool, setSelectedTool] = useState<'PING' | 'TELNET' | 'DNS' | 'HTTP/SSL' | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleFabPress = () => {
    if (activeTab === 'Klien') {
      setEditingClient('new');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {showSettings ? (
          <PengaturanScreen onBack={() => setShowSettings(false)} />
        ) : selectedClient ? (
          <ClientDetailScreen
            client={selectedClient}
            onBack={() => setSelectedClient(null)}
            onEdit={(client) => {
              setEditingClient(client);
              setSelectedClient(null);
            }}
            onDeleted={() => setSelectedClient(null)}
          />
        ) : editingClient ? (
          <ClientFormScreen
            initialClient={editingClient === 'new' ? undefined : editingClient}
            onCancel={() => setEditingClient(null)}
            onSaved={() => setEditingClient(null)}
          />
        ) : selectedTool ? (
          <ToolDetailScreen
            tool={selectedTool}
            onBack={() => setSelectedTool(null)}
          />
        ) : activeTab === 'Klien' ? (
          <KlienScreen
            onSelectClient={(c) => setSelectedClient(c)}
            onOpenSettings={() => setShowSettings(true)}
          />
        ) : activeTab === 'Tools' ? (
          <ToolsScreen
            onSelectTool={(t) => setSelectedTool(t)}
            onSelectHistory={(_run: ToolRun) => {}}
            onOpenSettings={() => setShowSettings(true)}
          />
        ) : activeTab === 'SSH' ? (
          <SshScreen onOpenSettings={() => setShowSettings(true)} />
        ) : (
          <SftpScreen onOpenSettings={() => setShowSettings(true)} />
        )}
      </View>

      {!showSettings && !selectedClient && !editingClient && !selectedTool && (
        <WavyNavBar
          activeTab={activeTab}
          onSelectTab={(t) => setActiveTab(t as Tab)}
          onFabPress={handleFabPress}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
  },
});
