"use client";

import { useEffect, useState } from "react";

export default function MascotBuddy() {
  const [wink, setWink] = useState(false);

  useEffect(() => {
    const onCelebrate = () => {
      setWink(true);
      if ("vibrate" in navigator) {
        try { (navigator as any).vibrate?.(60); } catch {}
      }
      setTimeout(()=>setWink(false), 1000);
    };
    window.addEventListener("celebrate", onCelebrate as EventListener);
    return () => window.removeEventListener("celebrate", onCelebrate as EventListener);
  }, []);

  return (
    <button
      aria-label="Little buddy"
      title="Little buddy"
      onClick={() => window.dispatchEvent(new CustomEvent("celebrate"))}
      className="fixed bottom-16 right-4 z-40 rounded-full bg-white/90 backdrop-blur border border-purple-200 shadow-md px-3 py-2 text-2xl"
    >
      <span className={wink ? "animate-pulse" : ""}>🐾</span>
    </button>
  );
}
