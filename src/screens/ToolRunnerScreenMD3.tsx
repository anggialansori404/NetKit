/**
 * NetKit MD3 - Tool Runner Screen (PING/TELNET/DNS/HTTP/SSL)
 * Compact MD3 version. Engine calls preserved.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { runPing, runTelnet, runDns, runHttpSsl } from '../engine/network';
import { store } from '../storage/storage';

const TOOL_META: Record<string, { targetLabel: string; targetPlaceholder: string; hint: string }> = {
  PING: { targetLabel: 'IP / Hostname', targetPlaceholder: '8.8.8.8', hint: 'Kirim 4x ICMP echo' },
  TELNET: { targetLabel: 'Host:Port', targetPlaceholder: '103.147.8.20:9090', hint: 'Cek koneksi TCP + banner' },
  DNS: { targetLabel: 'Hostname / IP', targetPlaceholder: 'gw-bpr.ussi.id', hint: 'Lookup A/AAAA & reverse PTR' },
  'HTTP/SSL': { targetLabel: 'URL', targetPlaceholder: 'https://example.com', hint: 'Status HTTP + info sertifikat' },
};

export function ToolRunnerScreenMD3({ navigation, route }: any) {
  const theme = useTheme();
  const { tool } = route.params;
  const meta = TOOL_META[tool] || TOOL_META.PING;

  const [target, setTarget] = useState('');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleRun = async () => {
    if (!target.trim() || running) return;
    setRunning(true);
    setOutput(null);
    try {
      let res: any;
      const t = target.trim();
      if (tool === 'PING') res = await runPing(t);
      else if (tool === 'TELNET') {
        const [h, p] = t.split(':');
        res = await runTelnet(h, parseInt(p, 10) || 23);
      } else if (tool === 'DNS') res = await runDns(t);
      else res = await runHttpSsl(t);
      const out = res.output || JSON.stringify(res, null, 2);
      setOutput(out);
      const now = new Date();
      const ts = now.toTimeString().slice(0, 8);
      store.addToolRun({
        tool: tool as 'PING' | 'TELNET' | 'DNS' | 'HTTP/SSL',
        target: t,
        timestamp: ts,
        ringkasan: out.split('\n')[0].slice(0, 80),
        output: out,
      });
    } catch (e: any) {
      setOutput(`Error: ${e.message || e}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={tool} subtitle={meta.hint} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label={meta.targetLabel}
          placeholder={meta.targetPlaceholder}
          value={target}
          onChangeText={setTarget}
          mode="outlined"
          dense
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleRun}
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleRun}
          loading={running}
          disabled={running || !target.trim()}
          icon="play"
        >
          Jalankan
        </Button>

        {running && (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              Menjalankan {tool}…
            </Text>
          </View>
        )}

        {output !== null && (
          <Card style={styles.resultCard}>
            <Card.Content>
              <Text variant="labelSmall" style={styles.resultLabel}>
                HASIL
              </Text>
              <Text variant="bodySmall"  selectable>
                {output}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  input: { marginBottom: 12 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  resultCard: { marginTop: 16 },
  resultLabel: { opacity: 0.6, marginBottom: 8 },
});
