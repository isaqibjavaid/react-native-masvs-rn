import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';
import { secureStorage } from 'react-native-masvs-rn';
import { useSession } from '../security/SessionProvider';
import { useLogger } from '../security/Logger';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
  const { login, prepareVaultSecret } = useSession();
  const { log } = useLogger();
  const [token, setToken] = useState('abc123');

  useEffect(() => {
    (async () => {
      const existing = await secureStorage.getSecret('token');
      if (existing) {
        log('INFO', 'Existing token found, redirecting to Dashboard');
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      }
    })();
  }, [navigation, log]);

  const onLogin = async () => {
    await login(token);

    // prepare biometric secret for vault demo
    try {
      await prepareVaultSecret();
    } catch (e) {
      log(
        'WARN',
        'Could not prepare biometric secret (simulator may not support)',
        String(e)
      );
    }

    Alert.alert(
      'Login',
      'Logged in securely (token stored via secureStorage).'
    );
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Login</Text>
      <Text style={styles.subtitle}>Token saved using secureStorage</Text>

      <TextInput
        style={styles.input}
        value={token}
        onChangeText={setToken}
        placeholder="Enter demo token"
        placeholderTextColor="#6F7C92"
      />

      <TouchableOpacity style={styles.btn} onPress={onLogin}>
        <Text style={styles.btnText}>Login (Secure)</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        This demo stores token securely and prepares biometric vault data
        (refreshToken).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0F1F' },
  title: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 16 },
  subtitle: { color: '#9DB6FF', marginTop: 8 },
  input: {
    marginTop: 20,
    backgroundColor: '#111827',
    color: 'white',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F2D55',
  },
  btn: {
    marginTop: 16,
    backgroundColor: '#1C7ED6',
    padding: 14,
    borderRadius: 10,
  },
  btnText: { color: 'white', fontWeight: '900', textAlign: 'center' },
  note: { color: '#6F7C92', marginTop: 12 },
});
