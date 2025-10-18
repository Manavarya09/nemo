"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

function todayKey() {
  const d = new Date();
  return `love-letter-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

export default function LoveLetterNote() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(todayKey());
    if (saved) setText(saved);
  }, []);

  const save = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(todayKey(), text.trim());
    setSaved(true);
    setTimeout(()=>setSaved(false), 1200);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-900">Daily Love Letter</h3>
      </div>
      <textarea
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder="Write a tiny loving note for yourself..."
        className="w-full h-24 rounded-xl border border-yellow-300 bg-white/90 p-3 text-sm outline-none focus:ring-2 focus:ring-yellow-300"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-yellow-700">Just for today. Be gentle and sweet.</p>
        <Button onClick={save} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Save
        </Button>
      </div>
      {saved && <p className="mt-2 text-xs text-yellow-700">Saved with love 💛</p>}
    </Card>
  );
}
