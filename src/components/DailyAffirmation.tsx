"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const affirmations = [
  "You are worthy of all the good things coming your way 💖",
  "Your presence makes the world brighter ✨",
  "You are stronger than you know 💪",
  "Today is full of possibilities for you 🌟",
  "You deserve all the love and happiness 💕",
  "Your smile lights up every room 😊",
  "You are doing better than you think 🌸",
  "You are enough, just as you are 💝",
  "Your kindness makes a difference 🦋",
  "You are loved beyond measure 💗",
];

export default function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    const today = new Date().toDateString();
    const seed = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    setAffirmation(affirmations[seed % affirmations.length]);
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
        <h3 className="text-lg font-semibold text-yellow-900">Daily Affirmation</h3>
      </div>
      <p className="text-center text-yellow-900 font-medium italic text-lg leading-relaxed">
        "{affirmation}"
      </p>
    </Card>
  );
}