"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Candy } from "lucide-react";
import confetti from "canvas-confetti";

const chocolates = [
  "Smooth Milk",
  "Twix",
  "Wafers",
  "M&M",
  "Hello Panda",
  "Hershey's",
];

export default function ChocolatePicker() {
  const [selected, setSelected] = useState("");
  const [picking, setPicking] = useState(false);

  const pickChocolate = () => {
    setPicking(true);
    setSelected("");

    setTimeout(() => {
      const choice = chocolates[Math.floor(Math.random() * chocolates.length)];
      setSelected(choice);
      setPicking(false);
      confetti({
        particleCount: 40,
        spread: 50,
        colors: ['#f4a6c8', '#e8d5f2', '#c8e6f5']
      });
    }, 1500);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Candy className="w-6 h-6 text-purple-500" />
        <h3 className="text-lg font-semibold text-purple-900">Chocolate Selector</h3>
      </div>

      <div className="text-center mb-4">
        {picking ? (
          <div className="text-4xl animate-pulse">🍫</div>
        ) : selected ? (
          <div>
            <div className="text-3xl mb-2 animate-bounce">🍫</div>
            <div className="text-xl font-semibold text-purple-800 mb-2">{selected}</div>
            <p className="text-sm text-purple-700 font-medium">
              You deserve a little sweetness today 🍫💞
            </p>
          </div>
        ) : (
          <div className="text-4xl text-purple-300">🎁</div>
        )}
      </div>

      <Button
        onClick={pickChocolate}
        disabled={picking}
        className="w-full bg-purple-400 hover:bg-purple-500 text-white"
      >
        {picking ? "Picking..." : "Pick My Chocolate!"}
      </Button>

      <p className="text-xs text-center mt-3 text-purple-600">
        Treat yourself, you've earned it! 🌟
      </p>
    </Card>
  );
}