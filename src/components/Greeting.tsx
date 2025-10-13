"use client";

import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function Greeting() {
  const [greeting, setGreeting] = useState("");
  const { data: session } = useSession();
  const name = session?.user?.name || "Bestie";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="text-center mb-8 animate-fade-in">
      <div className="flex items-center justify-center gap-2 mb-2">
        <h1 className="text-3xl font-fancy text-primary">Kittu-Space</h1>
        <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" />
      </div>
      <p className="text-xl font-medium text-foreground/80">
        {greeting}, {name}! 💕
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        You're doing amazing today ✨
      </p>
    </div>
  );
}