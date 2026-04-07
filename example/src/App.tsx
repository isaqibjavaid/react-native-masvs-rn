/* eslint-disable @typescript-eslint/no-unused-vars */
// MasvsRnTestScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  secureStorage,
  secureFetch,
  networkPolicy,
} from 'react-native-masvs-rn';

export default function App() {
  const [log, setLog] = useState<string[]>([]);

  const write = (msg: any) => {
    const text = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
    console.log('[MASVS]', text);
    setLog((prev) => [text, ...prev]);
  };

  // -------------------------------
  // SECURE STORAGE TESTS
  // -------------------------------

  const testSetSecret = async () => {
    await secureStorage.setSecret('token', 'abc123');
    write('✅ Saved token: abc123');
  };

  const testGetSecret = async () => {
    const token = await secureStorage.getSecret('token');
    write({ loadedToken: token });
  };

  const testDeleteSecret = async () => {
    await secureStorage.deleteSecret('token');
    write('🗑 Deleted token');
  };

  const testBiometricSecret = async () => {
    await secureStorage.setSecret('refreshToken', 'secret-value', {
      requireAuth: true,
    });
    write('🔐 Saved biometric secret: refreshToken');
  };

  // -------------------------------
  // NETWORK POLICY (TLS PINNING)
  // -------------------------------

  const testHostPinning = () => {
    networkPolicy.hosts['httpbin.org'] = {
      // Real public-key pin for httpbin.org (example pin)
      pins: ['sha256/5BWYNtPxvjsl+qhQLxo3jz3ZaK74xyHT/QdOhBB07i0='],
      failClosed: true,
      timeoutMs: 15000,
    };

    write('✅ TLS pinning enabled for httpbin.org');
  };

  // -------------------------------
  // SECURE NETWORKING TESTS
  // -------------------------------

  // ✅ Should SUCCEED (valid TLS + pinned)
  const testSecureFetchSuccess = async () => {
    try {
      const result = await secureFetch('https://httpbin.org/get', {
        method: 'GET',
      });
      write({ success: true, result });
    } catch (e) {
      write({ success: false, error: String(e) });
    }
  };

  // ❌ Should FAIL (wrong pin)
  const testInvalidPin = async () => {
    networkPolicy.hosts['httpbin.org'] = {
      pins: ['sha256/INVALID_PIN_SHOULD_FAIL=='],
      failClosed: true,
    };

    try {
      await secureFetch('https://httpbin.org/get');
      write('❌ ERROR: Request should have failed but succeeded');
    } catch (e) {
      write('❌ Pin mismatch correctly blocked request');
    }
  };

  const testHttpBlocked = async () => {
    try {
      await secureFetch('http://httpbin.org/get', {
        method: 'GET',
      });

      write('✅ HTTPS request success)');
    } catch (e) {
      write('❌ HTTP blocked: Insecure request rejected');
      write(String(e));
    }
  };

  // ❌ Should FAIL (un‑pinned host)
  const testFailClosed = async () => {
    try {
      await secureFetch('https://google.com');
      write('❌ ERROR: Unpinned host should be blocked');
    } catch (e) {
      write('❌ failClosed blocked unpinned host');
    }
  };

  // ❌ Should TIMEOUT
  const testTimeout = async () => {
    try {
      await secureFetch('https://10.255.255.1', { method: 'GET' });
      write('❌ ERROR: Timeout test should have failed');
    } catch (e) {
      write('✅ Timeout enforced correctly');
    }
  };

  // -------------------------------
  // UI
  // -------------------------------

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MASVS RN – Full Test Screen</Text>

      {/* -------- Secure Storage -------- */}
      <Text style={styles.section}>Secure Storage</Text>

      <TouchableOpacity style={styles.btn} onPress={testSetSecret}>
        <Text style={styles.btnText}>Set Secret (token)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={testGetSecret}>
        <Text style={styles.btnText}>Get Secret (token)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={testDeleteSecret}>
        <Text style={styles.btnText}>Delete Secret (token)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={testBiometricSecret}>
        <Text style={styles.btnText}>Set Biometric Secret</Text>
      </TouchableOpacity>

      {/* -------- Networking -------- */}
      <Text style={styles.section}>Secure Networking</Text>


      <TouchableOpacity style={styles.btn} onPress={testHttpBlocked}>
        <Text style={styles.btnText}>🚫 HTTP Block Test (Should Fail)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={testHostPinning}>
        <Text style={styles.btnText}>Configure TLS Pinning</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={testSecureFetchSuccess}>
        <Text style={styles.btnText}>✅ secureFetch (Pinned Success)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={testInvalidPin}>
        <Text style={styles.btnText}>❌ Invalid Pin Test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={testFailClosed}>
        <Text style={styles.btnText}>🚫 failClosed (Unpinned Host)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={testTimeout}>
        <Text style={styles.btnText}>⏱ Timeout Test</Text>
      </TouchableOpacity>

      {/* -------- Logs -------- */}
      <Text style={styles.section}>Logs</Text>

      <View style={styles.logBox}>
        {log.length === 0 ? (
          <Text style={styles.logText}>No logs yet.</Text>
        ) : (
          log.map((l, i) => (
            <Text key={i} style={styles.logText}>
              {l}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0A0F1F' },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    color: '#9DB6FF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#1F2D55',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnText: { color: 'white', fontSize: 14 },
  logBox: {
    backgroundColor: '#111827',
    padding: 12,
    minHeight: 200,
    borderRadius: 10,
  },
  logText: {
    color: '#D0D6E8',
    fontFamily: 'monospace',
    marginBottom: 6,
    fontSize: 12,
  },
});
