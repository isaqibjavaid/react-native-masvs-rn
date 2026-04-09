import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { networkPolicy, secureFetch } from 'react-native-masvs-rn';
import { useLogger } from '../security/Logger';
import { useMetrics } from '../security/Metrics';
import {
  DEMO_HOST,
  DEMO_PIN_HTTPBIN,
  insecureHttpUrl,
} from '../security/securityPolicy';

export default function PinningPolicyScreen() {
  const { log } = useLogger();
  const { bumpNet } = useMetrics();

  // -------------------------------
  // CONFIGURE TLS PINNING
  // -------------------------------
  const configurePinning = () => {
    networkPolicy.hosts[DEMO_HOST] = {
      pins: [DEMO_PIN_HTTPBIN],
      failClosed: true,
      timeoutMs: 15000,
    };

    bumpNet('PIN_CONFIGURED', DEMO_HOST);
    log(
      'SECURITY',
      `TLS pinning configured for ${DEMO_HOST}`,
      networkPolicy.hosts[DEMO_HOST]
    );
  };

  // -------------------------------
  // PINNED SUCCESS
  // -------------------------------
  const pinnedSuccess = async () => {
    try {
      const res = await secureFetch(`https://${DEMO_HOST}/get`, {
        method: 'GET',
      });
      bumpNet('PIN_SUCCESS');
      log('INFO', 'Pinned request succeeded ✅', res);
    } catch (e) {
      bumpNet('PIN_FAIL');
      log('ERROR', 'Pinned request failed ❌', String(e));
    }
  };

  // -------------------------------
  // INVALID PIN TEST
  // -------------------------------
  const invalidPin = async () => {
    networkPolicy.hosts[DEMO_HOST] = {
      pins: ['sha256/INVALID_PIN_SHOULD_FAIL=='],
      failClosed: true,
    };

    try {
      await secureFetch(`https://${DEMO_HOST}/get`);
      bumpNet('PIN_FAIL');
      log('ERROR', '❌ Invalid pin should have blocked but succeeded');
    } catch (e) {
      bumpNet('PIN_FAIL');
      log('SECURITY', 'Invalid pin correctly blocked ✅', String(e));
    }
  };

  // -------------------------------
  // HTTP BLOCK TEST
  // -------------------------------
  const httpBlocked = async () => {
    const url = insecureHttpUrl(`${DEMO_HOST}/get`); // builds "http://httpbin.org/get"

    try {
      await secureFetch(url, { method: 'GET' });
      bumpNet('NET_SUCCESS', 'http-should-block');
      log('ERROR', '❌ HTTP request should have been blocked');
    } catch (e) {
      bumpNet('HTTP_BLOCK');
      log('SECURITY', 'HTTP blocked as insecure ✅', String(e));
    }
  };

  // -------------------------------
  // FAIL-CLOSED (UNPINNED HOST)
  // -------------------------------
  const failClosedUnpinned = async () => {
    try {
      await secureFetch('https://google.com', { method: 'GET' });
      bumpNet('NET_SUCCESS', 'unlisted-host');
      log('WARN', 'google.com succeeded (depends on strict mode setting)');
    } catch (e) {
      bumpNet('FAIL_CLOSED');
      log('SECURITY', 'failClosed blocked unpinned host ✅', String(e));
    }
  };

  // -------------------------------
  // TIMEOUT TEST
  // -------------------------------
  const timeoutTest = async () => {
    try {
      await secureFetch('https://10.255.255.1', { method: 'GET' });
      bumpNet('NET_SUCCESS', 'timeout-should-fail');
      log('ERROR', '❌ Timeout should have failed but succeeded');
    } catch (e) {
      bumpNet('TIMEOUT');
      log('SECURITY', 'Timeout enforced ✅', String(e));
    }
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pinning & Network Policy</Text>
      <Text style={styles.subtitle}>
        Prove TLS pinning, HTTP blocking, fail‑closed behavior, and timeouts.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={configurePinning}>
        <Text style={styles.btnText}>Configure TLS Pinning (httpbin.org)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={pinnedSuccess}>
        <Text style={styles.btnText}>✅ Pinned Request Success</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={invalidPin}>
        <Text style={styles.btnText}>❌ Invalid Pin Test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={httpBlocked}>
        <Text style={styles.btnText}>🚫 HTTP Block Test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={failClosedUnpinned}>
        <Text style={styles.btnText}>🚫 failClosed (Unpinned Host)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={timeoutTest}>
        <Text style={styles.btnText}>⏱ Timeout Test</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        MITM demo: intercept {DEMO_HOST} using Charles / Proxyman — pinning
        should fail.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0A0F1F',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#9DB6FF',
    marginTop: 8,
    marginBottom: 14,
  },
  btn: {
    backgroundColor: '#1F2D55',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: {
    color: 'white',
    fontWeight: '900',
  },
  note: {
    color: '#6F7C92',
    marginTop: 16,
    fontSize: 12,
  },
});
