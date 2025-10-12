"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Square, Bell, BellOff } from "lucide-react";
import {
  requestNotificationPermission,
  sendNotification,
  notificationTemplates,
  getNotificationPreferences,
} from "@/lib/notifications";

export default function FastingTimer() {
  const [isActive, setIsActive] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastNotifiedHour, setLastNotifiedHour] = useState(0);
  const fastingGoal = 16;
  const progress = (hours / fastingGoal) * 100;

  useEffect(() => {
    // Check notification permissions on mount
    const prefs = getNotificationPreferences();
    setNotificationsEnabled(prefs.fastingEnabled);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setMinutes((m) => {
          if (m === 59) {
            setHours((h) => {
              const newHours = h + 1;
              
              // Send milestone notifications every 4 hours
              if (notificationsEnabled && newHours > lastNotifiedHour && newHours % 4 === 0 && newHours < fastingGoal) {
                const config = notificationTemplates["fasting-milestone"](newHours);
                sendNotification(config);
                setLastNotifiedHour(newHours);
              }
              
              // Send completion notification
              if (notificationsEnabled && newHours === fastingGoal) {
                const config = notificationTemplates["fasting-complete"]();
                sendNotification(config);
              }
              
              return newHours;
            });
            return 0;
          }
          return m + 1;
        });
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isActive, notificationsEnabled, lastNotifiedHour, fastingGoal]);

  const handleStart = async () => {
    if (!isActive && notificationsEnabled) {
      // Request permission if starting with notifications
      const granted = await requestNotificationPermission();
      if (granted) {
        const config = notificationTemplates["fasting-start"]();
        sendNotification(config);
      }
    }
    setIsActive(!isActive);
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-900">Fasting Timer</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className="h-8 w-8 p-0"
        >
          {notificationsEnabled ? (
            <Bell className="w-4 h-4 text-purple-500" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-400" />
          )}
        </Button>
      </div>

      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-purple-200"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
            className="text-purple-500 transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-purple-700">
            {hours}h {minutes}m
          </span>
          <span className="text-xs text-purple-500">/ {fastingGoal}h</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleStart}
          className="flex-1 bg-purple-400 hover:bg-purple-500 text-white"
        >
          {isActive ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button
          onClick={() => {
            setIsActive(false);
            setHours(0);
            setMinutes(0);
            setLastNotifiedHour(0);
          }}
          variant="outline"
          className="border-purple-300 text-purple-700"
        >
          Reset
        </Button>
      </div>

      {hours >= fastingGoal && (
        <p className="text-center mt-3 text-sm text-purple-700 font-medium">
          ✨ Goal reached! You're crushing it!
        </p>
      )}
    </Card>
  );
}