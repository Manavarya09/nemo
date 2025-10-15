"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import confetti from "canvas-confetti";
import { OptionWheel } from "@/components/OptionWheel";

const dinnerOptions = [
  "Aloo Paratha + Samosa Pav 🥔",
  "Chole Bhature 🍛",
  "Bhel Puri 🥗",
  "Fries 🍟",
  "Paneer Rice 🍚",
  "Mess ka boring food 😑",
];

const dinnerPalette = [
  "#fed7aa",
  "#fb923c",
  "#fdba74",
  "#facc15",
  "#fecdd3",
  "#f97316",
];

const spinDuration = 3200;

export default function DinnerWheel() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const timeoutRef = useRef<number>();

  const startSpin = () => {
    if (spinning) {
      return;
    }

    const segmentAngle = 360 / dinnerOptions.length;
    const selectedIndex = Math.floor(Math.random() * dinnerOptions.length);
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

    setSpinning(true);
    setResult(null);
    setRotation(nextRotation);

    timeoutRef.current = window.setTimeout(() => {
      const choice = dinnerOptions[selectedIndex];
      setResult(choice);
      setSpinning(false);

      if (typeof window !== "undefined") {
        confetti({
          particleCount: 60,
          spread: 70,
          colors: ["#f97316", "#facc15", "#fecdd3"],
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
    <Card className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-6 shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <Utensils className="h-6 w-6 text-orange-500" />
        <h3 className="text-lg font-semibold text-orange-900">Dinner Wheel</h3>
      </div>

      <OptionWheel
        options={dinnerOptions}
        rotation={rotation}
        palette={dinnerPalette}
        pointerColor="#f97316"
        labelColor="#7c3412"
        size={260}
      />

      <div className="mt-6 text-center">
        {spinning && !result && (
          <p className="text-sm font-medium text-orange-700 animate-pulse">
            Spinning for tonight&apos;s treat...
          </p>
        )}

        {result && (
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-orange-900">{result}</p>
            <p className="text-sm font-medium text-orange-700">
              Yumm! That&apos;s a perfect choice 🍽️
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={startSpin}
        disabled={spinning}
        className="mt-6 w-full bg-orange-400 text-white hover:bg-orange-500 disabled:opacity-60"
      >
        {spinning ? "Spinning..." : "Spin the Wheel!"}
      </Button>

      <p className="mt-3 text-center text-xs text-orange-600">
        Can&apos;t decide? Let me help! 🎲
      </p>
    </Card>
  );
}
