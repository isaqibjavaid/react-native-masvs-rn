import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { secureStorage } from 'react-native-masvs-rn';
import { useLogger } from './Logger';
import { useMetrics } from './Metrics';

type SessionCtx = {
  isLoggedIn: boolean;
  isVaultUnlocked: boolean;

  bootstrap: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;

  prepareVaultSecret: () => Promise<void>;
  unlockVault: () => Promise<boolean>;
  lockVault: () => void;
};

const SessionContext = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { log } = useLogger();
  const { bumpStorage } = useMetrics();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

  const appState = useRef(AppState.currentState);
  const lockTimer = useRef<NodeJS.Timeout | null>(null);

  const stopLockTimer = () => {
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = null;
  };

  const startAutoLock = () => {
    stopLockTimer();
    lockTimer.current = setTimeout(() => {
      setIsVaultUnlocked(false);
      bumpStorage('VAULT_LOCK', 'auto-timeout');
      log('SECURITY', 'Vault auto-locked due to inactivity timeout');
    }, 60_000);
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current === 'active' && next === 'background') {
        setIsVaultUnlocked(false);
        bumpStorage('VAULT_LOCK', 'background');
        log('SECURITY', 'Vault locked because app went to background');
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [bumpStorage, log]);

  const value = useMemo<SessionCtx>(
    () => ({
      isLoggedIn,
      isVaultUnlocked,

      bootstrap: async () => {
        const token = await secureStorage.getSecret('token');
        setIsLoggedIn(!!token);
        log('INFO', 'Bootstrap: token presence checked', { hasToken: !!token });
      },

      login: async (token: string) => {
        await secureStorage.setSecret('token', token);
        bumpStorage('ST_SET', 'token');
        setIsLoggedIn(true);
        log('SECURITY', 'User logged in (token stored securely)');
      },

      logout: async () => {
        await secureStorage.deleteSecret('token');
        bumpStorage('ST_DELETE', 'token');
        setIsLoggedIn(false);
        setIsVaultUnlocked(false);
        stopLockTimer();
        log('SECURITY', 'User logged out (token deleted, vault locked)');
      },

      prepareVaultSecret: async () => {
        await secureStorage.setSecret('refreshToken', 'secret-value', {
          requireAuth: true,
        });
        bumpStorage('BIO_SET', 'refreshToken');
        log(
          'SECURITY',
          'Prepared biometric secret refreshToken for vault demo'
        );
      },

      unlockVault: async () => {
        try {
          const v = await secureStorage.getSecret('refreshToken'); // triggers biometric
          if (v) {
            setIsVaultUnlocked(true);
            bumpStorage('BIO_UNLOCK_SUCCESS');
            log('SECURITY', 'Vault unlocked via biometrics');
            startAutoLock();
            return true;
          }
          bumpStorage('BIO_UNLOCK_FAIL');
          log('WARN', 'Vault unlock failed or canceled');
          return false;
        } catch (e) {
          bumpStorage('BIO_UNLOCK_FAIL');
          log('ERROR', 'Vault unlock error', String(e));
          return false;
        }
      },

      lockVault: () => {
        setIsVaultUnlocked(false);
        bumpStorage('VAULT_LOCK', 'manual');
        stopLockTimer();
        log('SECURITY', 'Vault locked manually');
      },
    }),
    [isLoggedIn, isVaultUnlocked, bumpStorage, log]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
