import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../AppNavigator';
import { secureStorage } from 'react-native-masvs-rn';
import { useLogger } from '../security/Logger';

type Props = NativeStackScreenProps<RootStackParamList, 'SplashGate'>;

export default function SplashGate({ navigation }: Props) {
  const { log } = useLogger();
  const hasNavigated = useRef(false); // ✅ prevents multiple navigations

  useEffect(() => {
    const init = async () => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      try {
        const token = await secureStorage.getSecret('token');

        if (token) {
          log('INFO', 'SplashGate: token found → Dashboard');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        } else {
          log('INFO', 'SplashGate: no token → Login');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch (e) {
        log('ERROR', 'SplashGate error, routing to Login', String(e));
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    init();
  }, [navigation, log]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MASVS Real‑World Demo</Text>
      <Text style={styles.subtitle}>
        Secure Storage • Biometrics • TLS Pinning
      </Text>

      <ActivityIndicator
        size="large"
        color="#79c0ff"
        style={{ marginTop: 24 }}
      />

      <Text style={styles.loading}>Checking secure session…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: '#9DB6FF',
    marginTop: 8,
    textAlign: 'center',
  },
  loading: {
    color: '#6F7C92',
    marginTop: 16,
  },
});
