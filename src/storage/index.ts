import * as Keychain from 'react-native-keychain';

export type StoragePolicy = {
  requireAuth?: boolean;
  service?: string;
  accessible?: Keychain.ACCESSIBLE;

  // Optional: retrieval preference (some type defs expose this via a separate option type)
  authenticationType?: Keychain.AUTHENTICATION_TYPE;
};

const DEFAULTS = {
  service: 'masvs-rn',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// Extend GetOptions locally to support authenticationType even if the installed typings don’t include it.
type GetOptionsWithAuthType = Keychain.GetOptions & {
  authenticationType?: Keychain.AUTHENTICATION_TYPE;
};

export const secureStorage = {
  async setSecret(key: string, value: string, policy: StoragePolicy = {}) {
    const service = policy.service ?? DEFAULTS.service;
    const accessible = policy.accessible ?? DEFAULTS.accessible;

    const options: Keychain.SetOptions = { service, accessible };

    // SetOptions supports access control; it does NOT include authenticationType. [1](https://blog.logrocket.com/how-to-implement-ssl-certificate-pinning-react-native/)
    if (policy.requireAuth) {
      options.accessControl =
        Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE;
      options.authenticationPrompt = {
        title: 'Authenticate to store secret',
        cancel: 'Cancel',
      };
    }

    return Keychain.setGenericPassword(key, value, options);
  },

  async getSecret(key: string, policy: StoragePolicy = {}) {
    const service = policy.service ?? DEFAULTS.service;

    const options: GetOptionsWithAuthType = { service };

    if (policy.requireAuth) {
      options.accessControl =
        Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE;

      // Documented as a retrieval option in AuthenticationTypeOption.
      options.authenticationType =
        policy.authenticationType ??
        Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS;

      options.authenticationPrompt = {
        title: 'Authenticate to retrieve secret',
        cancel: 'Cancel',
      };
    }

    const creds = await Keychain.getGenericPassword(
      options as Keychain.GetOptions
    );

    if (!creds) return null;
    if (creds.username !== key) return null;
    return creds.password;
  },

  async deleteSecret(policy: StoragePolicy = {}) {
    const service = policy.service ?? DEFAULTS.service;
    return Keychain.resetGenericPassword({ service });
  },

  async wipeAll(policy: StoragePolicy = {}) {
    return this.deleteSecret(policy);
  },
};
