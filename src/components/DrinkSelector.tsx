"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import confetti from "canvas-confetti";

const drinks = [
  "Sprite",
  "Blue Sprite",
  "Normal Sprite",
  "Sprite Zero",
  "7Up",
];

export default function DrinkSelector() {
  const [selected, setSelected] = useState("");
  const [selecting, setSelecting] = useState(false);

  const selectDrink = () => {
    setSelecting(true);
    setSelected("");

    setTimeout(() => {
      const choice = drinks[Math.floor(Math.random() * drinks.length)];
      setSelected(choice);
      setSelecting(false);
      confetti({
        particleCount: 30,
        spread: 40,
        colors: ['#c8e6f5', '#c8f5d8', '#ffffff']
      });
    }, 1500);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
      <div className="flex items-center gap-2 mb-4">
        <Coffee className="w-6 h-6 text-cyan-500" />
        <h3 className="text-lg font-semibold text-cyan-900">Drink Selector</h3>
      </div>

      <div className="text-center mb-4">
        {selecting ? (
          <div className="text-4xl animate-bounce">🥤</div>
        ) : selected ? (
          <div>
            <div className="text-3xl mb-2 animate-bounce">🥤</div>
            <div className="text-xl font-semibold text-cyan-800 mb-2">{selected}</div>
            <p className="text-sm text-cyan-700 font-medium">
              Refreshing choice ✨ stay bubbly!
            </p>
          </div>
        ) : (
          <div className="text-4xl text-cyan-300">💧</div>
        )}
      </div>

      <Button
        onClick={selectDrink}
        disabled={selecting}
        className="w-full bg-cyan-400 hover:bg-cyan-500 text-white"
      >
        {selecting ? "Selecting..." : "Pick My Drink!"}
      </Button>

      <p className="text-xs text-center mt-3 text-cyan-600">
        Quench your thirst! 💫
      </p>
    </Card>
  );
}