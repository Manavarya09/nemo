"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import confetti from "canvas-confetti";
import { OptionWheel, createWheelSlices, WheelSegment } from "@/components/OptionWheel";

const dinnerSegments: WheelSegment[] = [
  { label: "Aloo Paratha + Samosa Pav 🥔", weight: 2 },
  { label: "Chole Bhature 🍛", weight: 2 },
  { label: "Bhel Puri 🥗", weight: 2 },
  { label: "Fries 🍟", weight: 2 },
  { label: "Paneer Rice 🍚", weight: 2 },
  { label: "Mess ka boring food 😑", weight: 1 },
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slices = useMemo(() => createWheelSlices(dinnerSegments), []);
  const totalWeight = useMemo(
    () => slices.reduce((sum, slice) => sum + slice.weight, 0),
    [slices],
  );

  const startSpin = () => {
    if (spinning || slices.length === 0) {
      return;
    }

    const randomValue = Math.random() * totalWeight;
    let cumulative = 0;
    let chosenIndex = slices.length - 1;

    for (let index = 0; index < slices.length; index += 1) {
      cumulative += slices[index].weight;
      if (randomValue <= cumulative) {
        chosenIndex = index;
        break;
      }
    }

    const targetSlice = slices[chosenIndex];
    const currentNormalized = ((rotation % 360) + 360) % 360;
    const desiredNormalized = (360 - targetSlice.centerAngle + 360) % 360;
    let delta = desiredNormalized - currentNormalized;

    if (delta <= 0) {
      delta += 360;
    }

    const extraSpins = 4 + Math.floor(Math.random() * 3);
    const nextRotation = rotation + extraSpins * 360 + delta;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSpinning(true);
    setResult(null);
    setRotation(nextRotation);

    timeoutRef.current = setTimeout(() => {
      setResult(targetSlice.label);
      setSpinning(false);

      confetti({
        particleCount: 60,
        spread: 70,
        colors: ["#f97316", "#facc15", "#fecdd3"],
      });
    }, spinDuration);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-6 shadow-md space-y-6">
      <div className="flex items-center gap-2">
        <Utensils className="h-6 w-6 text-orange-500" />
        <h3 className="text-lg font-semibold text-orange-900">Dinner Wheel</h3>
      </div>

      <OptionWheel
        slices={slices}
        rotation={rotation}
        palette={dinnerPalette}
        pointerColor="#f97316"
        labelColor="#7c3412"
        size={280}
      />

      <div className="text-center">
        {spinning && !result && (
          <p className="animate-pulse text-sm font-medium text-orange-700">
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
        className="w-full bg-orange-400 text-white hover:bg-orange-500 disabled:opacity-60"
      >
        {spinning ? "Spinning..." : "Spin the Wheel!"}
      </Button>

      <p className="mt-3 text-center text-xs text-orange-600">
        Can&apos;t decide? Let me help! 🎲
      </p>
    </Card>
  );
}
