"use client";

import { Card } from "@/components/ui/card";

export default function LoveLetterCard() {
  return (
    <Card className="p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 border-2 border-pink-200 rounded-3xl shadow-md">
      <div className="mb-3 text-center">
        <h3 className="text-xl font-semibold text-pink-800">To my Kittu, with all my love 💖</h3>
      </div>
      <div className="space-y-3 text-pink-900/90 leading-relaxed text-sm">
        <p>
          You are my favorite person, my soft place, and my brightest little star.
          I love the way you smile, the way you care, and the way you make every
          ordinary moment feel special.
        </p>
        <p>
          I love you in the quiet mornings and the sleepy nights, in the silly jokes
          and the gentle hugs, in every breath and every heartbeat. You are home to me.
        </p>
        <p>
          I choose you—today, tomorrow, and in all the tiny forevers between.
          Thank you for being you. Always and forever, with all my heart. 💞
        </p>
      </div>
    </Card>
  );
}
