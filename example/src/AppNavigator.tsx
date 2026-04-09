import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashGate from './screens/SplashGate';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import StorageScreen from './screens/StorageScreen';
import BiometricVaultScreen from './screens/BiometricVaultScreen';
import NetworkingScreen from './screens/NetworkingScreen';
import PinningPolicyScreen from './screens/PinningPolicyScreen';
import LogsScreen from './screens/LogsScreen';
import SecurityDashboardScreen from './screens/SecurityDashboardScreen';
import MasvsScannerScreen from './screens/MasvsScannerScreen';

export type RootStackParamList = {
  SplashGate: undefined;
  Login: undefined;
  Dashboard: undefined;

  Storage: undefined;
  Vault: undefined;
  Networking: undefined;
  Pinning: undefined;
  Logs: undefined;

  SecurityDashboard: undefined;
  MasvsScanner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SplashGate"
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0F1F' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#0A0F1F' },
      }}
    >
      <Stack.Screen
        name="SplashGate"
        component={SplashGate}
        options={{ title: 'MASVS Demo' }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ title: 'Dashboard' }}
      />

      <Stack.Screen
        name="Storage"
        component={StorageScreen}
        options={{ title: 'Secure Storage' }}
      />
      <Stack.Screen
        name="Vault"
        component={BiometricVaultScreen}
        options={{ title: 'Biometric Vault' }}
      />
      <Stack.Screen
        name="Networking"
        component={NetworkingScreen}
        options={{ title: 'Secure Networking' }}
      />
      <Stack.Screen
        name="Pinning"
        component={PinningPolicyScreen}
        options={{ title: 'Pinning & Policy' }}
      />
      <Stack.Screen
        name="Logs"
        component={LogsScreen}
        options={{ title: 'Logs & Audit' }}
      />

      <Stack.Screen
        name="SecurityDashboard"
        component={SecurityDashboardScreen}
        options={{ title: 'Security Dashboard' }}
      />
      <Stack.Screen
        name="MasvsScanner"
        component={MasvsScannerScreen}
        options={{ title: 'MASVS Scanner' }}
      />
    </Stack.Navigator>
  );
}
