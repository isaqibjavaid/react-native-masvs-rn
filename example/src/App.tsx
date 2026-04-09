import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import { LoggerProvider } from './security/Logger';
import { MetricsProvider } from './security/Metrics';
import { SessionProvider } from './security/SessionProvider';

export default function App() {
  return (
    <LoggerProvider>
      <MetricsProvider>
        <SessionProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SessionProvider>
      </MetricsProvider>
    </LoggerProvider>
  );
}