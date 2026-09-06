// Cross-platform Mobile Notification Manager (iOS 16.4+ Web Push & Android Chrome/Safari)

export async function requestMobileNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Native Notifications not supported on this browser/device.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      triggerDeviceVibration([100, 50, 100]);
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function sendMobileNotification(title: string, body: string, icon = '/favicon.svg') {
  // Device Haptic Feedback
  triggerDeviceVibration([80, 40, 80]);

  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: 'uno-game-event',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('Notification trigger fallback:', err);
    }
  }
}

export function triggerDeviceVibration(pattern: number[] = [100, 50, 100]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Haptics not supported or user gesture required
    }
  }
}
