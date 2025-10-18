"use client";

import { Card } from "@/components/ui/card";

export default function BreathingFlower() {
  return (
    <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-rose-500 text-xl" aria-hidden>🌸</span>
        <h3 className="text-lg font-semibold text-rose-900">Gentle Breathing</h3>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-40 w-40">
          <div className="absolute inset-0 rounded-full bg-rose-200/50 animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute inset-4 rounded-full bg-rose-300/60 animate-[pulse_6s_ease-in-out_infinite_1.2s]" />
          <div className="absolute inset-8 rounded-full bg-rose-400/60 animate-[pulse_6s_ease-in-out_infinite_2.4s]" />
          <div className="absolute inset-12 rounded-full bg-white/90 shadow-inner" />
        </div>
        <p className="text-sm text-rose-800">Inhale 4s • Hold 2s • Exhale 4s</p>
      </div>
    </Card>
  );
}
