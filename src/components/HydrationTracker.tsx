"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Plus, Minus, Bell, BellOff } from "lucide-react";
import {
  requestNotificationPermission,
  scheduleNotification,
  notificationTemplates,
  getNotificationPreferences,
  saveNotificationPreferences,
  areNotificationsEnabled,
} from "@/lib/notifications";

export default function HydrationTracker() {
  const [glasses, setGlasses] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTimeout, setReminderTimeout] = useState<number | null>(null);
  const [goalUnits, setGoalUnits] = useState<number>(5);
  const unitMl = 500;

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem("hydrationGlasses");
    if (saved) {
      setGlasses(parseInt(saved));
    }

    // Check notification preferences
    const prefs = getNotificationPreferences();
    setNotificationsEnabled(prefs.hydrationEnabled && areNotificationsEnabled());

    // Set up recurring reminders if enabled
    if (prefs.hydrationEnabled && areNotificationsEnabled()) {
      scheduleHydrationReminders(prefs.hydrationInterval);
    }
  }, []);

  const scheduleHydrationReminders = (intervalHours: number) => {
    // Clear existing timeout
    if (reminderTimeout) {
      clearTimeout(reminderTimeout);
    }

    // Schedule next reminder
    const delayMs = intervalHours * 60 * 60 * 1000;
    const timeoutId = scheduleNotification("hydration", delayMs, goalUnits - glasses);
    setReminderTimeout(timeoutId);

    // Schedule the next one after this
    setTimeout(() => {
      scheduleHydrationReminders(intervalHours);
    }, delayMs);
  };

  const addGlass = () => {
    const newCount = Math.min(glasses + 1, 50);
    setGlasses(newCount);
    localStorage.setItem("hydrationGlasses", newCount.toString());

    // Send encouragement when goal is reached
    if (newCount === goalUnits && notificationsEnabled) {
      const config = {
        title: "🎉 Hydration Goal Reached!",
        body: "You did it! You're staying beautifully hydrated 💧",
        tag: "hydration-goal",
      };
      setTimeout(() => {
        if (areNotificationsEnabled()) {
          new Notification(config.title, {
            body: config.body,
            icon: "/favicon.ico",
            tag: config.tag,
          });
        }
      }, 500);
    }
  };

  const removeGlass = () => {
    const newCount = Math.max(glasses - 1, 0);
    setGlasses(newCount);
    localStorage.setItem("hydrationGlasses", newCount.toString());
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        const prefs = getNotificationPreferences();
        prefs.hydrationEnabled = true;
        saveNotificationPreferences(prefs);
        
        // Start reminders
        scheduleHydrationReminders(prefs.hydrationInterval);
      }
    } else {
      setNotificationsEnabled(false);
      if (reminderTimeout) {
        clearTimeout(reminderTimeout);
      }
      const prefs = getNotificationPreferences();
      prefs.hydrationEnabled = false;
      saveNotificationPreferences(prefs);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-900">Hydration</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className="h-8 w-8 p-0"
          title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
        >
          {notificationsEnabled ? (
            <Bell className="w-4 h-4 text-blue-500" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-400" />
          )}
        </Button>
      </div>

      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-blue-600 mb-1">{(glasses * unitMl) / 1000}L</div>
        <p className="text-xs text-blue-500">{unitMl} ml per tab</p>
        <p className="text-sm text-blue-500 mt-1">
          {glasses >= goalUnits ? "Goal reached! 🎉" : `${(goalUnits - glasses) * unitMl} ml to go`}
        </p>
      </div>

      <div className="flex gap-2 mb-1">
        <Button
          onClick={removeGlass}
          disabled={glasses === 0}
          variant="outline"
          className="flex-1 border-blue-300 text-blue-700"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          onClick={addGlass}
          className="flex-1 bg-blue-400 hover:bg-blue-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add 500 ml
        </Button>
      </div>

      <div className="mb-3">
        <div className="flex gap-1">
          {Array.from({ length: Math.max(goalUnits, glasses || 0) }).map((_, i) => (
            <div
              key={i}
              className={`h-3 flex-1 rounded-full ${i < glasses ? "bg-blue-400" : "bg-blue-100"}`}
              title={`${(i + 1) * unitMl} ml`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            onClick={() => {
              const next = 4;
              setGoalUnits(next);
              localStorage.setItem("hydrationGoalUnits", String(next));
            }}
            className={`text-xs px-2 py-1 rounded-md border ${goalUnits === 4 ? "bg-blue-100 border-blue-300 text-blue-700" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}
          >
            4 tabs
          </button>
          <button
            onClick={() => {
              const next = 5;
              setGoalUnits(next);
              localStorage.setItem("hydrationGoalUnits", String(next));
            }}
            className={`text-xs px-2 py-1 rounded-md border ${goalUnits === 5 ? "bg-blue-100 border-blue-300 text-blue-700" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}
          >
            5 tabs
          </button>
        </div>
      </div>

      {notificationsEnabled && (
        <p className="text-xs text-blue-500 mt-3 text-center">
          🔔 You'll get reminders every 2 hours
        </p>
      )}
    </Card>
  );
}
