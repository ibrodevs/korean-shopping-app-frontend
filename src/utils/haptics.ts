import * as Haptics from 'expo-haptics';

export async function hapticSelection() {
  try {
    await Haptics.selectionAsync();
  } catch {
    // no-op on unsupported environments
  }
}

export async function hapticSuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // no-op
  }
}

export async function hapticWarning() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // no-op
  }
}
