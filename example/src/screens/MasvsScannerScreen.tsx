import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLogger } from '../security/Logger';

// Generate/update this JSON using your CLI and place it here:
// src/assets/masvs-report.json
const report = require('../assets/masvs-report.json');

type Finding = {
  level: 'FAIL' | 'WARN';
  rule: string;
  file: string;
  message: string;
};

export default function MasvsScannerScreen() {
  const { log } = useLogger();
  const [filter, setFilter] = useState<'ALL' | 'FAIL' | 'WARN'>('ALL');

  const findings: Finding[] = report?.findings ?? [];
  const summary = report?.summary ?? { fail: 0, warn: 0 };

  const filtered = useMemo(() => {
    if (filter === 'ALL') return findings;
    return findings.filter((f) => f.level === filter);
  }, [filter, findings]);

  const explain = (rule: string) => {
    switch (rule) {
      case 'MASVS-NET-HTTP':
      case 'MASVS-NETWORK-HTTP':
        return 'Fix: replace http:// with https:// and enforce HTTPS in secureFetch.';
      case 'MASVS-STORAGE-ASYNCSTORAGE':
        return 'Fix: never store secrets in AsyncStorage; use secureStorage.';
      case 'MASVS-CODE-LOGGING':
        return 'Fix: avoid logging secrets; remove logs in production builds.';
      default:
        return 'Fix: review this rule and update code accordingly.';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MASVS Scanner</Text>
      <Text style={styles.sub}>
        Displays latest static scan results (from your CLI report).
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>FAIL</Text>
          <Text style={[styles.kpiValue, { color: '#E53935' }]}>
            {summary.fail}
          </Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>WARN</Text>
          <Text style={[styles.kpiValue, { color: '#FB8C00' }]}>
            {summary.warn}
          </Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>TOTAL</Text>
          <Text style={styles.kpiValue}>{findings.length}</Text>
        </View>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'ALL' && styles.filterActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'FAIL' && styles.filterActive]}
          onPress={() => setFilter('FAIL')}
        >
          <Text style={styles.filterText}>Fail</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'WARN' && styles.filterActive]}
          onPress={() => setFilter('WARN')}
        >
          <Text style={styles.filterText}>Warn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            { marginLeft: 'auto', backgroundColor: '#1C7ED6' },
          ]}
          onPress={() => log('INFO', 'MASVS report viewed', summary)}
        >
          <Text style={styles.filterText}>Log View</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.item}>No findings for this filter.</Text>
        ) : (
          filtered.map((f, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text
                  style={[
                    styles.badge,
                    f.level === 'FAIL' ? styles.badgeFail : styles.badgeWarn,
                  ]}
                >
                  {f.level}
                </Text>
                <Text style={styles.rule}>{f.rule}</Text>
              </View>

              <Text style={styles.file}>{f.file}</Text>
              <Text style={styles.msg}>{f.message}</Text>

              <Text style={styles.fixTitle}>Suggested fix:</Text>
              <Text style={styles.fix}>{explain(f.rule)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Text style={styles.foot}>
        Tip: regenerate the JSON report after code changes (from repo root):
        {'\n'}npm run masvs-check -- --json example/src/assets/masvs-report.json
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0F1F' },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  sub: { color: '#9DB6FF', marginTop: 8, marginBottom: 12 },

  summaryRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  kpi: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2D55',
  },
  kpiLabel: { color: '#9DB6FF', fontWeight: '900' },
  kpiValue: { color: 'white', fontSize: 18, fontWeight: '900', marginTop: 8 },

  filters: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    alignItems: 'center',
  },
  filterBtn: {
    backgroundColor: '#1F2D55',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  filterActive: { borderWidth: 1, borderColor: '#79c0ff' },
  filterText: { color: 'white', fontWeight: '900' },

  list: { marginTop: 14 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2D55',
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '900',
    fontSize: 12,
    color: 'white',
  },
  badgeFail: { backgroundColor: '#E53935' },
  badgeWarn: { backgroundColor: '#FB8C00' },
  rule: {
    color: '#D0D6E8',
    fontWeight: '900',
    marginLeft: 10,
    flex: 1,
    textAlign: 'right',
  },
  file: {
    color: '#6F7C92',
    marginTop: 8,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  msg: { color: '#D0D6E8', marginTop: 10 },
  fixTitle: { color: '#9DB6FF', marginTop: 12, fontWeight: '900' },
  fix: { color: 'white', marginTop: 6 },

  item: { color: '#D0D6E8' },
  foot: { color: '#6F7C92', marginTop: 10 },
});
