import { Capacitor } from '@capacitor/core';

/**
 * Platform detection — single source of truth.
 * isNative = true  → running inside Android/iOS Capacitor app
 * isNative = false → running in a regular browser (web)
 */
export const isNative = Capacitor.isNativePlatform();
export const isWeb = !isNative;
export const platform = isNative ? 'mobile' : 'web';
