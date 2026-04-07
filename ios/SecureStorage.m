#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SecureStorage, NSObject)

RCT_EXTERN_METHOD(setSecret:(NSString*)key
                  withValue:(NSString*)value
                  withOptions:(NSDictionary*)options
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getSecret:(NSString*)key
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deleteSecret:(NSString*)key
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

@end