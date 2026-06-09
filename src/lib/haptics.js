/**
 * Mjuk haptisk feedback — web: navigator.vibrate; Expo-native via global hook om tillgänglig.
 */

const PATTERNS = {
  light: 12,
  medium: [18, 8, 22],
  success: [10, 6, 14, 6, 20],
  swipe: [8, 4, 16],
};

function tryNavigatorVibrate(pattern) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
    return true;
  }
  return false;
}

/** Expo shell kan injicera Haptics på window före app-start. */
async function tryExpoHaptic(type) {
  const expo = typeof globalThis !== 'undefined' ? globalThis.__ANCHOR_EXPO_HAPTICS__ : null;
  if (!expo) return false;
  try {
    if (type === 'success' && expo.notificationAsync) {
      await expo.notificationAsync(expo.NotificationFeedbackType?.Success ?? 'success');
    } else if (expo.impactAsync) {
      await expo.impactAsync(
        type === 'medium'
          ? (expo.ImpactFeedbackStyle?.Medium ?? 'medium')
          : (expo.ImpactFeedbackStyle?.Light ?? 'light'),
      );
    }
    return true;
  } catch {
    return false;
  }
}

/** @param {'light' | 'medium' | 'success' | 'swipe'} [kind] */
export async function triggerHaptic(kind = 'light') {
  const pattern = PATTERNS[kind] || PATTERNS.light;
  const expoType = kind === 'success' ? 'success' : kind === 'medium' ? 'medium' : 'light';
  const viaExpo = await tryExpoHaptic(expoType);
  if (!viaExpo) tryNavigatorVibrate(pattern);
}
