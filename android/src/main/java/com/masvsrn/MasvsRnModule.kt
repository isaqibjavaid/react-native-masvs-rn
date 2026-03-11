package com.masvsrn

import com.facebook.react.bridge.ReactApplicationContext

class MasvsRnModule(reactContext: ReactApplicationContext) :
  NativeMasvsRnSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeMasvsRnSpec.NAME
  }
}
