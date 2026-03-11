
# react-native-masvs-rn

MASVS-aligned security utilities for **React Native (bare)** apps:
- ✅ Secure storage wrapper (Keychain/Keystore)
- ✅ Secure networking wrapper with HTTPS-only + optional host-based public-key pinning
- ✅ `masvs-check` CLI guardrails (basic CODE checks)

> ⚠️ This package improves security posture but cannot make an app 100% secure.

---

## Features

### Secure Storage (MASVS-STORAGE / CRYPTO)
- Stores secrets using platform secure storage (Keychain/Keystore)
- Optional biometric/passcode protection

### Secure Networking (MASVS-NETWORK)
- Blocks `http://` (HTTPS-only)
- Optional public-key pinning per hostname (fail-closed default)

### Code Guardrails (MASVS-CODE)
- CLI checks for `http://`, `AsyncStorage` usage, and `console.log` patterns

---

## Installation


```sh

pm install react-native-masvs-rn
# or
yarn add react-native-masvs-rn

# iOS (bare React Native)
cd ios
pod install
cd ..

```


## Usage


```js
// Secure Storage
import { secureStorage } from "react-native-masvs-rn";

await secureStorage.setSecret("token", "abc123");
const token = await secureStorage.getSecret("token");
await secureStorage.deleteSecret();

// With biometric/passcode requirement:

await secureStorage.setSecret("refreshToken", "secret-value", {
  requireAuth: true,
});

// Secure Networking

import { secureFetch } from "react-native-masvs-rn";

const res = await secureFetch("https://api.example.com/profile", { method: "GET" });

```

## Configure host pinning (public-key pinning default)


```js
// Edit your networkPolicy (in your app or in the library depending on how you expose it):

import { networkPolicy } from "react-native-masvs-rn";

networkPolicy.hosts["api.example.com"] = {
  pins: ["sha256/CURRENT_PIN==", "sha256/NEXT_PIN=="],
  failClosed: true,
  timeoutMs: 15000,
};


```

##  CLI (MASVS-CODE checks)

```js
npx masvs-check .

```

- Fails (exit code 1) if http:// is detected
- Warns on AsyncStorage and console.log

## Compatibility

- React Native: bare workflow
- iOS + Android supported
- Requires native build environment for the example app (Xcode for iOS)

## Security Notes

- Prefer pinning only on sensitive hosts (auth/payment APIs)
- Use two pins (current + next) to allow certificate key rotation safely
- Never store secrets in AsyncStorage or hardcode secrets in the app bundle

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

This project is licensed under the terms of the MIT license.

---
