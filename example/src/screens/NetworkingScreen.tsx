import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { secureFetch } from 'react-native-masvs-rn';
import { useLogger } from '../security/Logger';
import { useMetrics } from '../security/Metrics';

export default function NetworkingScreen() {
  const { log } = useLogger();
  const { bumpNet } = useMetrics();
  const [response, setResponse] = useState<string>('(none)');

  const call = async (url: string) => {
    try {
      const res = await secureFetch(url, { method: 'GET' });
      bumpNet('NET_SUCCESS', url);
      log('INFO', `secureFetch success: ${url}`, res);
      setResponse(JSON.stringify(res, null, 2));
    } catch (e) {
      bumpNet('NET_FAIL', url);
      log('ERROR', `secureFetch failed: ${url}`, String(e));
      setResponse(String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Networking</Text>
      <Text style={styles.subtitle}>
        Demo calls using secureFetch (HTTPS enforcement + policy).
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => call('https://httpbin.org/get')}
      >
        <Text style={styles.btnText}>GET https://httpbin.org/get</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => call('https://httpbin.org/anything/profile')}
      >
        <Text style={styles.btnText}>GET /anything/profile</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Response</Text>
      <ScrollView style={styles.box}>
        <Text style={styles.code}>{response}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0F1F' },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#9DB6FF', marginTop: 8, marginBottom: 12 },
  btn: {
    backgroundColor: '#1F2D55',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: { color: 'white', fontWeight: '900' },
  section: {
    color: '#9DB6FF',
    fontWeight: '900',
    marginTop: 18,
    marginBottom: 10,
  },
  box: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    maxHeight: 260,
    borderWidth: 1,
    borderColor: '#1F2D55',
  },
  code: { color: '#D0D6E8', fontFamily: 'monospace', fontSize: 12 },
});
