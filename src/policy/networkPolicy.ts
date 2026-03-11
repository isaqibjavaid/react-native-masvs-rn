export type PinningMode = 'none' | 'publicKey' | 'certificate';

export type HostPolicy = {
  mode?: PinningMode;
  pins?: string[];
  failClosed?: boolean;
  timeoutMs?: number;
};

export type NetworkPolicy = {
  default: HostPolicy;
  hosts: Record<string, HostPolicy>;
};

export const networkPolicy: NetworkPolicy = {
  default: {
    mode: 'none',
    timeoutMs: 15000,
  },
  hosts: {
    // Example (replace with your test hosts later)
    'api.example.com': {
      // mode omitted -> defaults to publicKey if pins exist
      pins: ['sha256/CURRENT_PIN==', 'sha256/NEXT_PIN=='],
      failClosed: true,
      timeoutMs: 20000,
    },
  },
};
