import { fetch as pinnedFetch } from 'react-native-ssl-pinning';
import { networkPolicy } from '../policy/networkPolicy';
import type { HostPolicy, PinningMode } from '../policy/networkPolicy';

/**
 * Keep our public API simple and compatible with secure JSON requests.
 * IMPORTANT: react-native-ssl-pinning Options expects body: string | object | undefined
 * so we do not accept FormData/Blob/null here.
 */
export type SecureFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | object; // ✅ no null, no FormData
  timeoutMs?: number;
};

function getHost(url: string): string {
  return new URL(url).host;
}

function resolveHostPolicy(url: string): HostPolicy {
  const host = getHost(url);
  const hp = networkPolicy.hosts[host] ?? networkPolicy.default;

  // Default to publicKey when pins exist
  if (hp?.pins?.length && !hp.mode) {
    return { ...hp, mode: 'publicKey' };
  }
  return hp;
}

/**
 * Normal fetch with timeout for unpinned hosts.
 */
async function fetchWithTimeout(
  url: string,
  opts: SecureFetchOptions,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: opts.method,
      headers: opts.headers,
      // Standard fetch supports string body. If object is provided, stringify it.
      body:
        typeof opts.body === 'string'
          ? opts.body
          : opts.body
          ? JSON.stringify(opts.body)
          : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function secureFetch(url: string, opts: SecureFetchOptions = {}) {
  // 1) Enforce HTTPS-only
  if (url.startsWith('http://')) {
    throw new Error(
      'Blocked insecure transport: HTTP is not allowed. Use HTTPS.'
    );
  }

  const hp = resolveHostPolicy(url);
  const mode: PinningMode = hp.mode ?? 'none';
  const timeoutMs = opts.timeoutMs ?? hp.timeoutMs ?? 15000;

  // 2) No pinning -> normal fetch
  if (mode === 'none') {
    return fetchWithTimeout(url, opts, timeoutMs);
  }

  // 3) Pinning enabled: pins required
  if (!hp.pins || hp.pins.length === 0) {
    throw new Error(
      `Pinning enabled for host "${getHost(url)}" but no pins configured.`
    );
  }

  const failClosed = hp.failClosed ?? true;

  // 4) Build pinning options (publicKey default)
  const pinningOptions =
    mode === 'publicKey'
      ? { pkPinning: true, sslPinning: { certs: hp.pins } }
      : { sslPinning: { certs: hp.pins } };

  // 5) Build the exact shape expected by react-native-ssl-pinning fetch.
  //    We only pass supported fields and ensure body is string|object|undefined.
  const pinFetchOptions = {
    method: opts.method ?? 'GET',
    headers: opts.headers ?? {},
    body: opts.body, // ✅ already string|object|undefined
    timeoutInterval: timeoutMs,
    ...pinningOptions,
  };

  try {
    return await pinnedFetch(url, pinFetchOptions as any);
  } catch (err) {
    if (failClosed) throw err;
    return fetchWithTimeout(url, opts, timeoutMs);
  }
}
