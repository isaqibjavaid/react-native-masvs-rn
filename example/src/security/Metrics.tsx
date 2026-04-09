import React, { createContext, useContext, useMemo, useState } from 'react';

export type NetEvent =
  | 'PIN_CONFIGURED'
  | 'PIN_SUCCESS'
  | 'PIN_FAIL'
  | 'HTTP_BLOCK'
  | 'FAIL_CLOSED'
  | 'TIMEOUT'
  | 'NET_SUCCESS'
  | 'NET_FAIL';

export type StorageEvent =
  | 'ST_SET'
  | 'ST_GET'
  | 'ST_DELETE'
  | 'BIO_SET'
  | 'BIO_UNLOCK_SUCCESS'
  | 'BIO_UNLOCK_FAIL'
  | 'VAULT_LOCK';

type MetricsState = {
  net: Record<NetEvent, number>;
  storage: Record<StorageEvent, number>;
  lastNet?: { event: NetEvent; ts: number; detail?: string };
  lastStorage?: { event: StorageEvent; ts: number; detail?: string };
};

type MetricsCtx = {
  metrics: MetricsState;
  bumpNet: (event: NetEvent, detail?: string) => void;
  bumpStorage: (event: StorageEvent, detail?: string) => void;
  reset: () => void;
};

const init: MetricsState = {
  net: {
    PIN_CONFIGURED: 0,
    PIN_SUCCESS: 0,
    PIN_FAIL: 0,
    HTTP_BLOCK: 0,
    FAIL_CLOSED: 0,
    TIMEOUT: 0,
    NET_SUCCESS: 0,
    NET_FAIL: 0,
  },
  storage: {
    ST_SET: 0,
    ST_GET: 0,
    ST_DELETE: 0,
    BIO_SET: 0,
    BIO_UNLOCK_SUCCESS: 0,
    BIO_UNLOCK_FAIL: 0,
    VAULT_LOCK: 0,
  },
};

const MetricsContext = createContext<MetricsCtx | null>(null);

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<MetricsState>(init);

  const api = useMemo<MetricsCtx>(
    () => ({
      metrics,
      bumpNet: (event, detail) => {
        setMetrics((prev) => ({
          ...prev,
          net: { ...prev.net, [event]: (prev.net[event] ?? 0) + 1 },
          lastNet: { event, ts: Date.now(), detail },
        }));
      },
      bumpStorage: (event, detail) => {
        setMetrics((prev) => ({
          ...prev,
          storage: { ...prev.storage, [event]: (prev.storage[event] ?? 0) + 1 },
          lastStorage: { event, ts: Date.now(), detail },
        }));
      },
      reset: () => setMetrics(init),
    }),
    [metrics]
  );

  return (
    <MetricsContext.Provider value={api}>{children}</MetricsContext.Provider>
  );
}

export function useMetrics() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error('useMetrics must be used within MetricsProvider');
  return ctx;
}
