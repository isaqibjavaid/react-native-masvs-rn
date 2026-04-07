import Foundation
import LocalAuthentication
import Security
import React   // 🔥 REQUIRED so RN types become available

@objc(SecureStorage)
class SecureStorage: NSObject {

  private func baseQuery(_ key: String) -> [String: Any] {
    return [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: "MASVSSecureStorage",
      kSecAttrAccount as String: key
    ]
  }

  @objc(setSecret:withValue:withOptions:withResolver:withRejecter:)
  func setSecret(key: String,
                 value: String,
                 options: NSDictionary?,
                 resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {   // 🟩 Works now

    let requireAuth = (options?["requireAuth"] as? Bool) ?? false

    var flags: SecAccessControlCreateFlags = []

    if requireAuth {
      flags = [.biometryCurrentSet]   // FaceID/TouchID
    }

    var error: Unmanaged<CFError>?
    guard let access = SecAccessControlCreateWithFlags(
      nil,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      flags,
      &error
    ) else {
      reject("access_control_error", "Unable to create access control", error?.takeRetainedValue())
      return
    }

    var query = baseQuery(key)
    query[kSecAttrAccessControl as String] = access
    query[kSecValueData as String] = value.data(using: .utf8)!

    SecItemDelete(query as CFDictionary)

    let status = SecItemAdd(query as CFDictionary, nil)

    if status == errSecSuccess {
      resolve(true)
    } else {
      let msg = SecCopyErrorMessageString(status, nil) as String? ?? "Unknown"
      reject("write_error", "Failed to save: \(msg)", nil)
    }
  }

  @objc(getSecret:withResolver:withRejecter:)
  func getSecret(key: String,
                 resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {   // 🟩 Works now

    var query = baseQuery(key)
    query[kSecReturnData as String] = true
    query[kSecUseOperationPrompt as String] = "Authenticate to access secret"  // biometric prompt

    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)

    if status == errSecSuccess,
       let data = item as? Data,
       let str = String(data: data, encoding: .utf8) {
      resolve(str)
    } else if status == errSecUserCanceled {
      reject("auth_canceled", "User canceled biometric authentication", nil)
    } else {
      resolve(nil)
    }
  }

  @objc(deleteSecret:withResolver:withRejecter:)
  func deleteSecret(key: String,
                    resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {   // 🟩 Works now

    SecItemDelete(baseQuery(key) as CFDictionary)
    resolve(true)
  }
}
