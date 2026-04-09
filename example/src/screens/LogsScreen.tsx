import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLogger } from '../security/Logger';

export default function LogsScreen() {
  const { logs, clear } = useLogger();

  const formatTime = (ts: number) => new Date(ts).toLocaleString();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>Logs & Audit Trail</Text>
        <TouchableOpacity onPress={clear}>
          <Text style={styles.clear}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.box}>
        {logs.length === 0 ? (
          <Text style={styles.item}>No logs yet.</Text>
        ) : (
          logs.map((l, idx) => (
            <Text key={idx} style={styles.item}>
              [{formatTime(l.ts)}] [{l.level}] {l.message}
              {l.data ? `\n${JSON.stringify(l.data, null, 2)}` : ''}
              {'\n'}
            </Text>
          ))
        )}
      </ScrollView>

      <Text style={styles.footer}>
        Use this screen in your supervisor demo to prove all security events
        happened.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0F1F' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: 'white', fontSize: 20, fontWeight: '900' },
  clear: { color: '#79c0ff', fontWeight: '900' },
  box: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1F2D55',
  },
  item: {
    color: '#D0D6E8',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 10,
  },
  footer: { color: '#6F7C92', marginTop: 12 },
});
