"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, RotateCcw, Bell, BellOff } from "lucide-react";
import {
  requestNotificationPermission,
  scheduleDailyNotification,
  getNotificationPreferences,
  saveNotificationPreferences,
  areNotificationsEnabled,
} from "@/lib/notifications";

export default function SleepTracker() {
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [hoursSlept, setHoursSlept] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem("sleepData");
    if (savedData) {
      const data = JSON.parse(savedData);
      setBedtime(data.bedtime || "");
      setWakeTime(data.wakeTime || "");
      setHoursSlept(data.hoursSlept || null);
    }

    // Check notification preferences
    const prefs = getNotificationPreferences();
    setNotificationsEnabled(prefs.sleepEnabled && areNotificationsEnabled());

    // Schedule daily sleep reminder if enabled
    if (prefs.sleepEnabled && areNotificationsEnabled()) {
      scheduleDailyNotification(
        "sleep-reminder",
        prefs.sleepReminder.hour,
        prefs.sleepReminder.minute
      );
    }
  }, []);

  const calculateSleep = () => {
    if (!bedtime || !wakeTime) return;

    const [bedHour, bedMin] = bedtime.split(":").map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

    // Handle overnight sleep (bedtime after midnight)
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    const totalMinutes = wakeMinutes - bedMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalHours = parseFloat((hours + minutes / 60).toFixed(1));

    setHoursSlept(totalHours);

    // Save to localStorage
    const sleepData = {
      bedtime,
      wakeTime,
      hoursSlept: totalHours,
      date: new Date().toISOString(),
    };
    localStorage.setItem("sleepData", JSON.stringify(sleepData));
  };

  const resetTracker = () => {
    setBedtime("");
    setWakeTime("");
    setHoursSlept(null);
    localStorage.removeItem("sleepData");
  };

  const getSleepMessage = (hours: number) => {
    if (hours < 6) return "You need more rest, beautiful 💙";
    if (hours < 7) return "Not bad! Try for a bit more 😴";
    if (hours < 9) return "Perfect! Well rested 💫";
    return "Wow, you really needed that rest! 🌙";
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        const prefs = getNotificationPreferences();
        prefs.sleepEnabled = true;
        saveNotificationPreferences(prefs);
        
        // Schedule sleep reminder
        scheduleDailyNotification(
          "sleep-reminder",
          prefs.sleepReminder.hour,
          prefs.sleepReminder.minute
        );
      }
    } else {
      setNotificationsEnabled(false);
      const prefs = getNotificationPreferences();
      prefs.sleepEnabled = false;
      saveNotificationPreferences(prefs);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-semibold text-indigo-900">Sleep Tracker</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleNotifications}
            className="h-8 w-8 p-0"
            title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 text-indigo-500" />
            ) : (
              <BellOff className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          {(bedtime || wakeTime) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetTracker}
              className="h-8 w-8 p-0"
              title="Reset tracker"
            >
              <RotateCcw className="w-4 h-4 text-indigo-400" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Moon className="w-5 h-5 text-indigo-400" />
          <div className="flex-1">
            <label className="text-sm text-indigo-700 block mb-1">Bedtime</label>
            <Input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Sun className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <label className="text-sm text-indigo-700 block mb-1">Wake Time</label>
            <Input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>
        </div>

        <Button
          onClick={calculateSleep}
          disabled={!bedtime || !wakeTime}
          className="w-full bg-indigo-400 hover:bg-indigo-500 text-white"
        >
          Calculate Sleep
        </Button>

        {hoursSlept !== null && (
          <div className="text-center p-4 bg-white/60 rounded-lg border border-indigo-100">
            <div className="text-3xl font-bold text-indigo-700 mb-1">
              {hoursSlept}h
            </div>
            <p className="text-sm text-indigo-600">{getSleepMessage(hoursSlept)}</p>
          </div>
        )}
      </div>

      {notificationsEnabled && (
        <p className="text-xs text-indigo-500 mt-3 text-center">
          🔔 You'll get a sleep reminder at 10 PM
        </p>
      )}
    </Card>
  );
}