"use client";

import Greeting from "@/components/Greeting";
import HydrationTracker from "@/components/HydrationTracker";
import MoodTracker from "@/components/MoodTracker";
import FastingTimer from "@/components/FastingTimer";
import MascotBuddy from "@/components/MascotBuddy";
import FirefliesOverlay from "@/components/FirefliesOverlay";
import DailyAffirmation from "@/components/DailyAffirmation";
import MedicineReminder from "@/components/MedicineReminder";
import DinnerWheel from "@/components/DinnerWheel";
import ChocolatePicker from "@/components/ChocolatePicker";
import DrinkSelector from "@/components/DrinkSelector";
import WeightTracker from "@/components/WeightTracker";
import SleepTracker from "@/components/SleepTracker";
import GratitudeJournal from "@/components/GratitudeJournal";
import ComplimentCamera from "@/components/ComplimentCamera";
import CycleTracker from "@/components/CycleTracker";
import FooterEasterEgg from "@/components/FooterEasterEgg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles, Utensils, TrendingUp, Flower2 } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [eggOpen, setEggOpen] = useState(false);
  const [eggTimer, setEggTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerEgg = () => {
    setEggOpen(true);
    if (eggTimer) clearTimeout(eggTimer);
    const t = setTimeout(() => setEggOpen(false), 4500);
    setEggTimer(t);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-8">
      <div className="max-w-md mx-auto px-4 py-6">
        <Greeting />

        <Tabs defaultValue="wellness" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/80 backdrop-blur">
            <TabsTrigger value="wellness" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Heart className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="cycle" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Flower2 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="fun" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Sparkles className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="food" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Utensils className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="tracking" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wellness" className="space-y-4 animate-fade-in">
            <DailyAffirmation />
            <MoodTracker />
            <HydrationTracker />
            <MedicineReminder />
            <SleepTracker />
          </TabsContent>

          <TabsContent value="cycle" className="space-y-4 animate-fade-in">
            <CycleTracker />
          </TabsContent>

          <TabsContent value="fun" className="space-y-4 animate-fade-in">
            <ComplimentCamera />
            <GratitudeJournal />
            <FastingTimer />
          </TabsContent>

          <TabsContent value="food" className="space-y-4 animate-fade-in">
            <DinnerWheel />
            <ChocolatePicker />
            <DrinkSelector />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4 animate-fade-in">
            <WeightTracker />
            <FastingTimer />
            <HydrationTracker />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Made with 💖 for <a href="#" role="button" aria-label="Open sweet message" onClick={(e)=>{e.preventDefault();triggerEgg();}} className="cursor-pointer underline decoration-dotted text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring/50 rounded-sm px-1">Kittu</a>
          </p>
        </div>
        <FooterEasterEgg show={eggOpen} onClose={()=>setEggOpen(false)} />
        <MascotBuddy />
        <FirefliesOverlay />
      </div>
    </div>
  );
}
