import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useMetrics } from '../security/Metrics';
import { useSession } from '../security/SessionProvider';

function MiniBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max <= 0 ? 0 : Math.round((value / max) * 100);
  return (
    <View style={{ marginTop: 10 }}>
      <View style={styles.rowBetween}>
        <Text style={styles.small}>{label}</Text>
        <Text style={styles.small}>{value}</Text>
      </View>
      <View style={styles.barBg}>
        <View
          style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

export default function SecurityDashboardScreen() {
  const { metrics, reset } = useMetrics();
  const { isLoggedIn, isVaultUnlocked } = useSession();

  const netTotal = Object.values(metrics.net).reduce((a, b) => a + b, 0);
  const stTotal = Object.values(metrics.storage).reduce((a, b) => a + b, 0);

  const lastNet = metrics.lastNet
    ? new Date(metrics.lastNet.ts).toLocaleString()
    : '—';
  const lastStorage = metrics.lastStorage
    ? new Date(metrics.lastStorage.ts).toLocaleString()
    : '—';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Security Health Dashboard</Text>
      <Text style={styles.sub}>
        Real-time metrics from secureStorage + secureFetch flows
      </Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Login</Text>
          <Text style={styles.kpiValue}>{isLoggedIn ? '✅' : '❌'}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Vault</Text>
          <Text style={styles.kpiValue}>
            {isVaultUnlocked ? 'Unlocked ✅' : 'Locked 🔒'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Networking Metrics</Text>
        <Text style={styles.small}>Total events: {netTotal}</Text>
        <Text style={styles.small}>
          Last: {metrics.lastNet?.event ?? '—'} @ {lastNet}
        </Text>

        <MiniBar
          label="Pinned Success"
          value={metrics.net.PIN_SUCCESS}
          max={Math.max(1, netTotal)}
          color="#43A047"
        />
        <MiniBar
          label="Pin Failures"
          value={metrics.net.PIN_FAIL}
          max={Math.max(1, netTotal)}
          color="#E53935"
        />
        <MiniBar
          label="HTTP Blocked"
          value={metrics.net.HTTP_BLOCK}
          max={Math.max(1, netTotal)}
          color="#FB8C00"
        />
        <MiniBar
          label="FailClosed Blocks"
          value={metrics.net.FAIL_CLOSED}
          max={Math.max(1, netTotal)}
          color="#8E24AA"
        />
        <MiniBar
          label="Timeouts"
          value={metrics.net.TIMEOUT}
          max={Math.max(1, netTotal)}
          color="#1C7ED6"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Storage Metrics</Text>
        <Text style={styles.small}>Total events: {stTotal}</Text>
        <Text style={styles.small}>
          Last: {metrics.lastStorage?.event ?? '—'} @ {lastStorage}
        </Text>

        <MiniBar
          label="Set Secret"
          value={metrics.storage.ST_SET}
          max={Math.max(1, stTotal)}
          color="#1C7ED6"
        />
        <MiniBar
          label="Get Secret"
          value={metrics.storage.ST_GET}
          max={Math.max(1, stTotal)}
          color="#79c0ff"
        />
        <MiniBar
          label="Delete Secret"
          value={metrics.storage.ST_DELETE}
          max={Math.max(1, stTotal)}
          color="#E53935"
        />
        <MiniBar
          label="Biometric Set"
          value={metrics.storage.BIO_SET}
          max={Math.max(1, stTotal)}
          color="#43A047"
        />
        <MiniBar
          label="Vault Unlock Success"
          value={metrics.storage.BIO_UNLOCK_SUCCESS}
          max={Math.max(1, stTotal)}
          color="#7ee787"
        />
        <MiniBar
          label="Vault Locks"
          value={metrics.storage.VAULT_LOCK}
          max={Math.max(1, stTotal)}
          color="#FB8C00"
        />
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={reset}>
        <Text style={styles.resetText}>Reset Metrics</Text>
      </TouchableOpacity>

      <Text style={styles.foot}>
        Show this screen to your supervisor: it proves measurable security
        behavior in real time.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0F1F' },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  sub: { color: '#9DB6FF', marginTop: 8, marginBottom: 12 },

  kpiRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  kpi: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2D55',
  },
  kpiLabel: { color: '#9DB6FF', fontWeight: '900' },
  kpiValue: { color: 'white', fontSize: 16, fontWeight: '900', marginTop: 8 },

  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2D55',
    marginTop: 14,
  },
  cardTitle: { color: 'white', fontWeight: '900', fontSize: 16 },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  small: { color: '#D0D6E8', fontSize: 12, marginTop: 6 },

  barBg: {
    height: 10,
    backgroundColor: '#1F2D55',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  barFill: { height: 10, borderRadius: 10 },

  resetBtn: {
    backgroundColor: '#1F2D55',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  resetText: { color: 'white', fontWeight: '900', textAlign: 'center' },

  foot: { color: '#6F7C92', marginTop: 14 },
});
