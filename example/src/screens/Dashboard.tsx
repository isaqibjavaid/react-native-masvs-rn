import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';
import { useSession } from '../security/SessionProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function Dashboard({ navigation }: Props) {
  const { logout, isVaultUnlocked } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Demo Dashboard</Text>
      <Text style={styles.subtitle}>
        Vault: {isVaultUnlocked ? 'Unlocked ✅' : 'Locked 🔒'}
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Storage')}
      >
        <Text style={styles.cardTitle}>Secure Storage</Text>
        <Text style={styles.cardSub}>Save / Read / Delete secrets</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Vault')}
      >
        <Text style={styles.cardTitle}>Biometric Vault</Text>
        <Text style={styles.cardSub}>
          Unlock medical records via biometrics
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Networking')}
      >
        <Text style={styles.cardTitle}>Secure Networking</Text>
        <Text style={styles.cardSub}>secureFetch demo on real endpoints</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Pinning')}
      >
        <Text style={styles.cardTitle}>Pinning & Policy</Text>
        <Text style={styles.cardSub}>
          TLS pins, failClosed, timeout, HTTP block
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SecurityDashboard')}
      >
        <Text style={styles.cardTitle}>Security Health Dashboard</Text>
        <Text style={styles.cardSub}>
          KPIs + charts from your security events
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MasvsScanner')}
      >
        <Text style={styles.cardTitle}>MASVS Scanner</Text>
        <Text style={styles.cardSub}>Show static scan report (FAIL/WARN)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Logs')}
      >
        <Text style={styles.cardTitle}>Logs & Audit</Text>
        <Text style={styles.cardSub}>Supervisor-friendly security trace</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: '#3B1D1D' }]}
        onPress={logout}
      >
        <Text style={styles.cardTitle}>Logout</Text>
        <Text style={styles.cardSub}>Delete token + lock vault</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0F1F' },
  title: { color: 'white', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#9DB6FF', marginTop: 8, marginBottom: 14 },
  card: {
    backgroundColor: '#1F2D55',
    padding: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: '900' },
  cardSub: { color: '#D0D6E8', marginTop: 6 },
});
