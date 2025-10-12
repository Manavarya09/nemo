"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import confetti from "canvas-confetti";

// Weighted array where "Mess ka boring food" appears only once (rare)
const dinnerOptions = [
  "Aloo Paratha + Samosa Pav 🥔",
  "Aloo Paratha + Samosa Pav 🥔",
  "Chole Bhature 🍛",
  "Chole Bhature 🍛",
  "Bhel Puri 🥗",
  "Bhel Puri 🥗",
  "Fries 🍟",
  "Fries 🍟",
  "Paneer Rice 🍚",
  "Paneer Rice 🍚",
  "Mess ka boring food 😑", // Appears rarely
];

export default function DinnerWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");

  const spin = () => {
    setSpinning(true);
    setResult("");
    
    setTimeout(() => {
      const choice = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];
      setResult(choice);
      setSpinning(false);
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#f4a6c8', '#c8e6f5', '#ffd4a3']
      });
    }, 2000);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
      <div className="flex items-center gap-2 mb-4">
        <Utensils className="w-6 h-6 text-orange-500" />
        <h3 className="text-lg font-semibold text-orange-900">Dinner Wheel</h3>
      </div>

      <div className="text-center mb-4">
        {spinning ? (
          <div className="text-4xl animate-spin">🎯</div>
        ) : result ? (
          <div>
            <div className="text-5xl mb-2 animate-bounce">{result}</div>
            <p className="text-sm text-orange-700 font-medium">
              Yumm! That's a perfect choice 🍽️
            </p>
          </div>
        ) : (
          <div className="text-4xl text-orange-300">🎡</div>
        )}
      </div>

      <Button
        onClick={spin}
        disabled={spinning}
        className="w-full bg-orange-400 hover:bg-orange-500 text-white"
      >
        {spinning ? "Spinning..." : "Spin the Wheel!"}
      </Button>

      <p className="text-xs text-center mt-3 text-orange-600">
        Can't decide? Let me help! 🎲
      </p>
    </Card>
  );
}