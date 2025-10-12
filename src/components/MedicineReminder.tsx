"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Bell, BellOff } from "lucide-react";
import {
  requestNotificationPermission,
  scheduleDailyNotification,
  getNotificationPreferences,
  saveNotificationPreferences,
  areNotificationsEnabled,
} from "@/lib/notifications";

const medicines = [
  { name: "PAN-D", time: "Morning", icon: "☀️", hour: 9 },
  { name: "Vitamin B12", time: "Evening", icon: "🌙", hour: 20 },
  { name: "Vitamin D", time: "Wednesday Morning", icon: "💊", hour: 9, weekday: 3 }, // Wednesday only
];

export default function MedicineReminder() {
  const [taken, setTaken] = useState<{ [key: string]: boolean }>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());

  useEffect(() => {
    // Update current day
    setCurrentDay(new Date().getDay());
    
    // Load taken status from localStorage
    const saved = localStorage.getItem("medicineTaken");
    if (saved) {
      setTaken(JSON.parse(saved));
    }

    // Check notification preferences
    const prefs = getNotificationPreferences();
    setNotificationsEnabled(prefs.medicineEnabled && areNotificationsEnabled());

    // Schedule daily notifications if enabled
    if (prefs.medicineEnabled && areNotificationsEnabled()) {
      scheduleDailyNotification("medicine-morning", prefs.medicineTimings.morning.hour, prefs.medicineTimings.morning.minute);
      scheduleDailyNotification("medicine-evening", prefs.medicineTimings.evening.hour, prefs.medicineTimings.evening.minute);
      
      // Schedule Wednesday-only notification for Vitamin D
      if (currentDay === 3) { // Wednesday
        scheduleDailyNotification("medicine-vitamin-d", 9, 0);
      }
    }
  }, []);

  const toggleTaken = (name: string) => {
    const newTaken = { ...taken, [name]: !taken[name] };
    setTaken(newTaken);
    localStorage.setItem("medicineTaken", JSON.stringify(newTaken));
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        const prefs = getNotificationPreferences();
        prefs.medicineEnabled = true;
        saveNotificationPreferences(prefs);
        
        // Schedule notifications
        scheduleDailyNotification("medicine-morning", prefs.medicineTimings.morning.hour, prefs.medicineTimings.morning.minute);
        scheduleDailyNotification("medicine-evening", prefs.medicineTimings.evening.hour, prefs.medicineTimings.evening.minute);
      }
    } else {
      setNotificationsEnabled(false);
      const prefs = getNotificationPreferences();
      prefs.medicineEnabled = false;
      saveNotificationPreferences(prefs);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-6 h-6 text-pink-400" />
          <h3 className="text-lg font-semibold text-pink-900">Medicine Tracker</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className="h-8 w-8 p-0"
          title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
        >
          {notificationsEnabled ? (
            <Bell className="w-4 h-4 text-pink-500" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-400" />
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {medicines.map((medicine) => {
          // Only show Wednesday medicines on Wednesday, or show all
          const shouldShow = !medicine.weekday || currentDay === medicine.weekday;
          
          return shouldShow ? (
            <div
              key={medicine.name}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-pink-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{medicine.icon}</span>
                <div>
                  <p className="font-medium text-pink-900">{medicine.name}</p>
                  <p className="text-xs text-pink-500">{medicine.time}</p>
                </div>
              </div>
              <Button
                onClick={() => toggleTaken(medicine.name)}
                variant={taken[medicine.name] ? "default" : "outline"}
                size="sm"
                className={
                  taken[medicine.name]
                    ? "bg-pink-400 hover:bg-pink-500 text-white"
                    : "border-pink-300 text-pink-700"
                }
              >
                {taken[medicine.name] ? "✓ Taken" : "Mark"}
              </Button>
            </div>
          ) : null;
        })}
      </div>

      {notificationsEnabled && (
        <p className="text-xs text-pink-500 mt-3 text-center">
          🔔 You'll get reminders at 9 AM and 8 PM
        </p>
      )}
    </Card>
  );
}