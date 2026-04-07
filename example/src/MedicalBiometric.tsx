import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  AppState,
  TouchableWithoutFeedback,
} from 'react-native';

import { secureStorage } from 'react-native-masvs-rn';

export default function MedicalBiometric() {
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState('Tap below to authenticate');
  const [countdown, setCountdown] = useState(20); // 60s secure session timer

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Fake lab results
  const fakeLabResults = [
    {
      name: 'Hemoglobin',
      value: '14.2 g/dL',
      range: '13.0 – 17.0',
      status: 'Normal',
    },
    {
      name: 'White Blood Cells',
      value: '11.3 x10^9/L',
      range: '4.0 – 10.0',
      status: 'High',
    },
    {
      name: 'Fasting Glucose',
      value: '132 mg/dL',
      range: '70 – 99',
      status: 'High',
    },
    {
      name: 'Creatinine',
      value: '0.9 mg/dL',
      range: '0.7 – 1.3',
      status: 'Normal',
    },
  ];

  // -------------------------
  // SECURE AUTO-LOGOUT LOGIC
  // -------------------------

  const startTimer = () => {
    stopTimer();
    setCountdown(20); // reset timer to 60 seconds

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          logoutUser();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const logoutUser = async () => {
    stopTimer();
    await secureStorage.deleteSecret('medical_access_key');
    setAuthenticated(false);
    setStatus('Session expired. Please authenticate again.');
    Alert.alert('Session Timeout', 'For security, you have been logged out.');
  };

  // Monitor app background/foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/active/) && nextState === 'background') {
        logoutUser();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  // Reset timer on touches (inactivity protection)
  const handleUserActivity = () => {
    if (authenticated) startTimer();
  };

  // -------------------------
  // BIOMETRIC AUTHENTICATION
  // -------------------------

  const handleBiometricAccess = async () => {
    try {
      setStatus('Authenticating…');

      await secureStorage.setSecret('medical_access_key', 'GRANTED', {
        requireAuth: true,
      });

      const token = await secureStorage.getSecret('medical_access_key');

      if (token) {
        setAuthenticated(true);
        setStatus('Access Granted ✔');
        startTimer();

        Alert.alert(
          'Biometric Authentication',
          'Authentication successful. Displaying lab results…'
        );
      } else {
        setStatus('Authentication Failed ❌');
      }
    } catch (err: any) {
      setStatus('Authentication Failed ❌');
      Alert.alert('Authentication Error', err.message ?? 'Unknown error');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleUserActivity}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Medical Records Access</Text>

        {!authenticated && (
          <>
            <Text style={styles.subText}>
              This demo simulates secure biometric access to confidential
              medical information.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={handleBiometricAccess}
            >
              <Text style={styles.buttonText}>
                Authenticate with FaceID / TouchID
              </Text>
            </TouchableOpacity>

            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={styles.status}>{status}</Text>
          </>
        )}

        {authenticated && (
          <>
            <Text style={styles.sectionHeader}>🧪 Lab Test Results</Text>
            <Text style={styles.sectionSub}>(Mock Data for Demo)</Text>

            <Text style={styles.timer}>Auto‑Logout in: {countdown}s</Text>

            {fakeLabResults.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.testName}>{item.name}</Text>
                  <Text
                    style={[
                      styles.badge,
                      item.status === 'High' && styles.high,
                      item.status === 'Normal' && styles.normal,
                      item.status === 'Low' && styles.low,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <Text style={styles.value}>{item.value}</Text>
                <Text style={styles.range}>Reference: {item.range}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

// -------------------------
// STYLES
// -------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F0F4FA' },

  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C3A70',
    marginBottom: 20,
    marginTop: 50,
  },

  subText: { fontSize: 16, color: '#4B5A7D', marginBottom: 30 },

  button: {
    backgroundColor: '#1C7ED6',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },

  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },

  statusLabel: {
    fontSize: 18,
    marginTop: 40,
    color: '#1C3A70',
    fontWeight: '600',
  },
  status: { marginTop: 8, fontSize: 20, color: '#0A4F8F', fontWeight: '700' },

  sectionHeader: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2E55',
  },
  sectionSub: { fontSize: 13, color: '#6F7C92', marginBottom: 20 },

  timer: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B00020',
    marginBottom: 15,
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between' },

  testName: { fontSize: 18, fontWeight: '600', color: '#2A3A5B' },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },

  high: { backgroundColor: '#E53935' },
  normal: { backgroundColor: '#43A047' },
  low: { backgroundColor: '#FB8C00' },

  value: { marginTop: 6, fontSize: 22, fontWeight: '700', color: '#1B2738' },
  range: { marginTop: 4, fontSize: 13, color: '#747F9A' },
});
