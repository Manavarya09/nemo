"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Candy } from "lucide-react";
import confetti from "canvas-confetti";
import { OptionWheel } from "@/components/OptionWheel";

const chocolateOptions = [
  "Smooth Milk",
  "Twix",
  "Wafers",
  "M&M",
  "Hello Panda",
  "Hershey's",
];

const chocolatePalette = [
  "#fce7f3",
  "#d8b4fe",
  "#f9a8d4",
  "#a855f7",
  "#fde68a",
  "#c084fc",
];

const spinDuration = 3200;

export default function ChocolatePicker() {
  const [rotation, setRotation] = useState(0);
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const timeoutRef = useRef<number>();

  const startPicking = () => {
    if (picking) {
      return;
    }

    const segmentAngle = 360 / chocolateOptions.length;
    const selectedIndex = Math.floor(Math.random() * chocolateOptions.length);
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

    setPicking(true);
    setSelected(null);
    setRotation(nextRotation);

    timeoutRef.current = window.setTimeout(() => {
      const choice = chocolateOptions[selectedIndex];
      setSelected(choice);
      setPicking(false);

      if (typeof window !== "undefined") {
        confetti({
          particleCount: 55,
          spread: 65,
          colors: ["#d8b4fe", "#f9a8d4", "#fde68a"],
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
    <Card className="rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <Candy className="h-6 w-6 text-purple-500" />
        <h3 className="text-lg font-semibold text-purple-900">Chocolate Selector</h3>
      </div>

      <OptionWheel
        options={chocolateOptions}
        rotation={rotation}
        palette={chocolatePalette}
        pointerColor="#a855f7"
        labelColor="#4c1d95"
        size={240}
      />

      <div className="mt-6 text-center">
        {picking && !selected && (
          <p className="text-sm font-medium text-purple-700 animate-pulse">
            Picking the sweetest treat...
          </p>
        )}

        {selected && (
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-purple-900">{selected}</p>
            <p className="text-sm font-medium text-purple-700">
              You deserve a little sweetness today 🍫💞
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={startPicking}
        disabled={picking}
        className="mt-6 w-full bg-purple-400 text-white hover:bg-purple-500 disabled:opacity-60"
      >
        {picking ? "Spinning..." : "Pick My Chocolate!"}
      </Button>

      <p className="mt-3 text-center text-xs text-purple-600">
        Treat yourself, you&apos;ve earned it! 🌟
      </p>
    </Card>
  );
}
