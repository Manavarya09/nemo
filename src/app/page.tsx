"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import Greeting from "@/components/Greeting";
import HydrationTracker from "@/components/HydrationTracker";
import MoodTracker from "@/components/MoodTracker";
import FastingTimer from "@/components/FastingTimer";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles, Utensils, TrendingUp, Flower2 } from "lucide-react";

export default function Home() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/sign-in");
      toast.success("Signed out successfully! See you soon! 💖");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-8">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-primary/20 hover:bg-primary/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

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
            Made with 💖 for Kittu
          </p>
        </div>
      </div>
    </div>
  );
}