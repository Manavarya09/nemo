"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Heart } from "lucide-react";

const moods = [
  { emoji: "😢", label: "Rough", color: "text-blue-400" },
  { emoji: "😕", label: "Meh", color: "text-purple-400" },
  { emoji: "😊", label: "Good", color: "text-pink-400" },
  { emoji: "😄", label: "Great", color: "text-rose-400" },
  { emoji: "🥰", label: "Amazing", color: "text-red-400" },
];

export default function MoodTracker() {
  const [mood, setMood] = useState([2]);
  const [logId, setLogId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTodayMood();
  }, []);

  const fetchTodayMood = async () => {
    try {
      const response = await fetch(`/api/mood?date=${today}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setMood([data[0].moodValue]);
          setLogId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching mood:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMood = async (newMood: number[]) => {
    setMood(newMood);
    const moodValue = newMood[0];
    const moodLabel = moods[moodValue].label;

    try {
      if (logId) {
        await fetch(`/api/mood?id=${logId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moodValue, moodLabel }),
        });
      } else {
        const response = await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: today, moodValue, moodLabel }),
        });
        if (response.ok) {
          const data = await response.json();
          setLogId(data.id);
        }
      }
    } catch (error) {
      console.error("Error updating mood:", error);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
        <div className="animate-pulse">
          <div className="h-6 bg-pink-200 rounded mb-4 w-3/4"></div>
          <div className="h-20 bg-pink-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const currentMood = moods[mood[0]];

  return (
    <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
        <h3 className="text-lg font-semibold text-pink-900">How are you feeling?</h3>
      </div>

      <div className="text-center mb-4">
        <div className="text-6xl mb-2 animate-bounce">{currentMood.emoji}</div>
        <p className={`text-lg font-semibold ${currentMood.color}`}>
          {currentMood.label}
        </p>
      </div>

      <Slider
        value={mood}
        onValueChange={updateMood}
        max={4}
        step={1}
        className="mb-4"
      />

      <p className="text-sm text-center text-pink-700">
        Remember: All feelings are valid, and I'm here for you 💕
      </p>
    </Card>
  );
}