
package com.masvsrn

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.facebook.react.bridge.*

class MasvsRnModule(val ctx: ReactApplicationContext)
  : ReactContextBaseJavaModule(ctx) {

  private val masterKey = MasterKey.Builder(ctx)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

  private val prefs = EncryptedSharedPreferences.create(
    ctx,
    "masvs_secure_storage",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
  )

  override fun getName(): String = "SecureStorage"

  @ReactMethod
  fun setSecret(key: String, value: String, options: ReadableMap?, promise: Promise) {
    prefs.edit().putString(key, value).apply()
    promise.resolve(true)
  }

  @ReactMethod
  fun getSecret(key: String, promise: Promise) {
    val res = prefs.getString(key, null)
    promise.resolve(res)
  }

  @ReactMethod
  fun deleteSecret(key: String, promise: Promise) {
    prefs.edit().remove(key).apply()
    promise.resolve(true)
  }
}
