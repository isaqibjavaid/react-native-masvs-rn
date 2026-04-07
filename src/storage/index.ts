import { NativeModules } from 'react-native';

const Native = NativeModules.SecureStorage;

export const secureStorage = {
  setSecret(key: string, value: string, options: any = {}) {
    return Native.setSecret(key, value, options);
  },
  getSecret(key: string) {
    return Native.getSecret(key);
  },
  deleteSecret(key: string) {
    return Native.deleteSecret(key);
  },
};
