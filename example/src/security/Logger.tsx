import React, { createContext, useContext, useMemo, useState } from 'react';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
export type LogEntry = {
  ts: number;
  level: LogLevel;
  message: string;
  data?: any;
};

type LoggerCtx = {
  logs: LogEntry[];
  log: (level: LogLevel, message: string, data?: any) => void;
  clear: () => void;
};

const LoggerContext = createContext<LoggerCtx | null>(null);

export function LoggerProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const value = useMemo<LoggerCtx>(
    () => ({
      logs,
      log: (level, message, data) => {
        const entry: LogEntry = { ts: Date.now(), level, message, data };
        console.log(`[MASVS][${level}]`, message, data ?? '');
        setLogs((prev) => [entry, ...prev].slice(0, 400));
      },
      clear: () => setLogs([]),
    }),
    [logs]
  );

  return (
    <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>
  );
}

export function useLogger() {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error('useLogger must be used within LoggerProvider');
  return ctx;
}
