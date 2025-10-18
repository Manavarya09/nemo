"use client";

import { useEffect, useState } from "react";

const messages = [
  "A tiny scroll floats by… you are precious 🌸",
  "Secret note: drink water and be kind to yourself 💖",
  "A whisper from the wind: you’re doing amazing ✨",
  "Small scroll, big love: you matter so much 💌",
];

type Props = { show: boolean; message?: string };

export default function FooterEasterEgg({ show, message }: Props) {
  if (!show) return null;

  const text = message || messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 select-none">
      <div className="flex items-center gap-2 rounded-2xl border border-purple-200/60 bg-white/90 backdrop-blur px-3 py-2 shadow-md animate-fade-in">
        <span className="text-xl" aria-hidden>🥷📜</span>
        <p className="text-xs text-foreground/80">
          {text}
        </p>
      </div>
    </div>
  );
}
