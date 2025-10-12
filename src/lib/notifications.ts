// Notification utility for HerSpace app

export type NotificationType = 
  | "fasting-start"
  | "fasting-milestone" 
  | "fasting-complete"
  | "medicine-morning"
  | "medicine-evening"
  | "hydration"
  | "sleep-reminder";

interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// Check if notifications are enabled
export function areNotificationsEnabled(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

// Send a notification
export function sendNotification(config: NotificationConfig): void {
  if (!areNotificationsEnabled()) {
    console.log("Notifications not enabled");
    return;
  }

  try {
    const notification = new Notification(config.title, {
      body: config.body,
      icon: config.icon || "/favicon.ico",
      tag: config.tag,
      badge: "/favicon.ico",
      requireInteraction: false,
      silent: false,
    });

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Notification templates
export const notificationTemplates: Record<NotificationType, (data?: any) => NotificationConfig> = {
  "fasting-start": () => ({
    title: "🌙 Fasting Started",
    body: "Your fasting timer has begun! You're doing great 💪",
    tag: "fasting",
  }),
  "fasting-milestone": (hours: number) => ({
    title: `✨ ${hours} Hours Fasted!`,
    body: `Keep going beautiful! You're ${hours} hours into your fast 💜`,
    tag: "fasting",
  }),
  "fasting-complete": () => ({
    title: "🎉 Fasting Goal Complete!",
    body: "You did it! 16 hours completed. Time to nourish yourself 🌸",
    tag: "fasting",
  }),
  "medicine-morning": () => ({
    title: "💊 Morning Medicine",
    body: "Time for PAN-D! Don't forget to take it with water 💧",
    tag: "medicine-morning",
  }),
  "medicine-evening": () => ({
    title: "💊 Evening Medicine",
    body: "Time for Vitamin B12! Take it with your dinner 🌸",
    tag: "medicine-evening",
  }),
  "hydration": (glassesLeft: number) => ({
    title: "💧 Hydration Reminder",
    body: glassesLeft > 0 
      ? `You have ${glassesLeft} glasses left today! Stay hydrated 💙`
      : "Time to drink some water! Your body will thank you 💦",
    tag: "hydration",
  }),
  "sleep-reminder": () => ({
    title: "😴 Sleep Time Soon",
    body: "It's getting late! Time to wind down and rest well tonight 🌙",
    tag: "sleep",
  }),
};

// Schedule a notification
export function scheduleNotification(
  type: NotificationType,
  delayMs: number,
  data?: any
): number {
  const timeoutId = window.setTimeout(() => {
    const config = notificationTemplates[type](data);
    sendNotification(config);
  }, delayMs);

  return timeoutId;
}

// Schedule daily notifications
export function scheduleDailyNotification(
  type: NotificationType,
  hour: number,
  minute: number = 0,
  data?: any
): void {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delayMs = scheduledTime.getTime() - now.getTime();
  
  scheduleNotification(type, delayMs, data);

  // Store in localStorage for persistence
  const scheduledNotifications = JSON.parse(
    localStorage.getItem("scheduledNotifications") || "[]"
  );
  
  scheduledNotifications.push({
    type,
    hour,
    minute,
    data,
    nextRun: scheduledTime.toISOString(),
  });
  
  localStorage.setItem(
    "scheduledNotifications",
    JSON.stringify(scheduledNotifications)
  );
}

// Get notification preferences from localStorage
export function getNotificationPreferences() {
  const defaults = {
    fastingEnabled: true,
    medicineEnabled: true,
    hydrationEnabled: true,
    sleepEnabled: true,
    medicineTimings: {
      morning: { hour: 9, minute: 0 }, // 9 AM
      evening: { hour: 20, minute: 0 }, // 8 PM
    },
    hydrationInterval: 2, // hours
    sleepReminder: { hour: 22, minute: 0 }, // 10 PM
  };

  const saved = localStorage.getItem("notificationPreferences");
  return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
}

// Save notification preferences
export function saveNotificationPreferences(preferences: any): void {
  localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
}