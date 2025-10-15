"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import confetti from "canvas-confetti";
import { OptionWheel } from "@/components/OptionWheel";

const drinkOptions = [
  "Sprite",
  "Blue Sprite",
  "Sprite Zero",
  "Sprite Ice",
  "7Up",
  "Lemonade",
];

const drinkPalette = [
  "#bae6fd",
  "#22d3ee",
  "#99f6e4",
  "#0ea5e9",
  "#c8f5d8",
  "#38bdf8",
];

const spinDuration = 3200;

export default function DrinkSelector() {
  const [rotation, setRotation] = useState(0);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const timeoutRef = useRef<number>();

  const startSelecting = () => {
    if (selecting) {
      return;
    }

    const segmentAngle = 360 / drinkOptions.length;
    const selectedIndex = Math.floor(Math.random() * drinkOptions.length);
    const targetCenter = selectedIndex * segmentAngle + segmentAngle / 2;
    const currentNormalized = ((rotation % 360) + 360) % 360;
    const desiredNormalized = (360 - targetCenter + 360) % 360;

    let delta = desiredNormalized - currentNormalized;
    if (delta <= 0) {
      delta += 360;
    }

    const extraSpins = 4 + Math.floor(Math.random() * 3);
    const nextRotation = rotation + extraSpins * 360 + delta;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setSelecting(true);
    setSelected(null);
    setRotation(nextRotation);

    timeoutRef.current = window.setTimeout(() => {
      const choice = drinkOptions[selectedIndex];
      setSelected(choice);
      setSelecting(false);

      if (typeof window !== "undefined") {
        confetti({
          particleCount: 45,
          spread: 60,
          colors: ["#22d3ee", "#0ea5e9", "#c8f5d8"],
        });
      }
    }, spinDuration);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <Coffee className="h-6 w-6 text-cyan-500" />
        <h3 className="text-lg font-semibold text-cyan-900">Drink Selector</h3>
      </div>

      <OptionWheel
        options={drinkOptions}
        rotation={rotation}
        palette={drinkPalette}
        pointerColor="#06b6d4"
        labelColor="#0f3b4c"
        size={240}
      />

      <div className="mt-6 text-center">
        {selecting && !selected && (
          <p className="text-sm font-medium text-cyan-700 animate-pulse">
            Shaking up something refreshing...
          </p>
        )}

        {selected && (
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-cyan-900">{selected}</p>
            <p className="text-sm font-medium text-cyan-700">
              Refreshing choice ✨ stay bubbly!
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={startSelecting}
        disabled={selecting}
        className="mt-6 w-full bg-cyan-400 text-white hover:bg-cyan-500 disabled:opacity-60"
      >
        {selecting ? "Spinning..." : "Pick My Drink!"}
      </Button>

      <p className="mt-3 text-center text-xs text-cyan-600">
        Quench your thirst! 💫
      </p>
    </Card>
  );
}
