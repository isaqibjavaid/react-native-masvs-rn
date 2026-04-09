import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { secureStorage } from 'react-native-masvs-rn';
import { useLogger } from '../security/Logger';
import { useMetrics } from '../security/Metrics';

export default function StorageScreen() {
  const { log } = useLogger();
  const { bumpStorage } = useMetrics();
  const [lastValue, setLastValue] = useState<string | null>(null);

  const setToken = async () => {
    await secureStorage.setSecret('token', 'abc123');
    bumpStorage('ST_SET', 'token');
    log('SECURITY', 'Saved token securely', { key: 'token' });
  };

  const getToken = async () => {
    const token = await secureStorage.getSecret('token');
    setLastValue(token ?? null);
    bumpStorage('ST_GET', 'token');
    log('INFO', 'Loaded token securely', { value: token });
  };

  const deleteToken = async () => {
    await secureStorage.deleteSecret('token');
    setLastValue(null);
    bumpStorage('ST_DELETE', 'token');
    log('SECURITY', 'Deleted token', { key: 'token' });
  };

  const setBiometric = async () => {
    await secureStorage.setSecret('refreshToken', 'secret-value', {
      requireAuth: true,
    });
    bumpStorage('BIO_SET', 'refreshToken');
    log('SECURITY', 'Saved biometric secret', { key: 'refreshToken' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Storage</Text>

      <TouchableOpacity style={styles.btn} onPress={setToken}>
        <Text style={styles.btnText}>Set Secret (token=abc123)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={getToken}>
        <Text style={styles.btnText}>Get Secret (token)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={deleteToken}>
        <Text style={styles.btnText}>Delete Secret (token)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={setBiometric}>
        <Text style={styles.btnText}>Set Biometric Secret (refreshToken)</Text>
      </TouchableOpacity>

      <Text style={styles.valueLabel}>Last read value:</Text>
      <Text style={styles.value}>{lastValue ?? '(none)'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0F1F' },
  title: { color: 'white', fontSize: 22, fontWeight: '900', marginBottom: 12 },
  btn: {
    backgroundColor: '#1F2D55',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: { color: 'white', fontWeight: '800' },
  valueLabel: { color: '#9DB6FF', marginTop: 18 },
  value: { color: '#D0D6E8', marginTop: 6, fontFamily: 'monospace' },
});
