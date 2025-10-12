"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Calendar, Flower2, Heart, Sparkles, Info, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";

interface CycleData {
  id?: number;
  lastPeriodStart: string;
  periodLength: number;
  cycleLength: number;
}

interface DailyLog {
  id?: number;
  date: string;
  cramps: boolean;
  headache: boolean;
  flowLevel: string;
  cravings: boolean;
  mood: string;
  energy: string;
  notes: string;
}

export default function CycleTracker() {
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState<CycleData>({
    lastPeriodStart: "",
    periodLength: 5,
    cycleLength: 28,
  });
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [todayLog, setTodayLog] = useState<DailyLog>({
    date: new Date().toISOString().split("T")[0],
    cramps: false,
    headache: false,
    flowLevel: "none",
    cravings: false,
    mood: "neutral",
    energy: "normal",
    notes: "",
  });

  useEffect(() => {
    fetchCycleData();
    fetchDailyLogs();
  }, []);

  const fetchCycleData = async () => {
    try {
      const response = await fetch("/api/cycle-data");
      if (response.ok) {
        const data = await response.json();
        setCycleData(data);
        setIsSetup(true);
      }
    } catch (error) {
      console.error("Error fetching cycle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyLogs = async () => {
    try {
      const response = await fetch("/api/cycle-logs?limit=90");
      if (response.ok) {
        const data = await response.json();
        setDailyLogs(data);
        
        const today = new Date().toISOString().split("T")[0];
        const todayEntry = data.find((log: any) => log.date === today);
        if (todayEntry) {
          setTodayLog({
            id: todayEntry.id,
            date: todayEntry.date,
            cramps: todayEntry.cramps === 1,
            headache: todayEntry.headache === 1,
            flowLevel: todayEntry.flowLevel,
            cravings: todayEntry.cravings === 1,
            mood: todayEntry.mood,
            energy: todayEntry.energy,
            notes: todayEntry.notes || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching cycle logs:", error);
    }
  };

  const saveCycleData = async (data: CycleData) => {
    try {
      const isoDate = new Date(data.lastPeriodStart + "T00:00:00.000Z").toISOString();
      
      const response = await fetch("/api/cycle-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lastPeriodStart: isoDate
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        setCycleData(saved);
        setIsSetup(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f4a6c8", "#e8d5f2", "#c8e6f5"],
        });
      }
    } catch (error) {
      console.error("Error saving cycle data:", error);
    }
  };

  const saveDailyLog = async () => {
    try {
      const logData = {
        date: todayLog.date,
        cramps: todayLog.cramps ? 1 : 0,
        headache: todayLog.headache ? 1 : 0,
        flowLevel: todayLog.flowLevel,
        cravings: todayLog.cravings ? 1 : 0,
        mood: todayLog.mood,
        energy: todayLog.energy,
        notes: todayLog.notes || null,
      };

      if (todayLog.id) {
        await fetch(`/api/cycle-logs?id=${todayLog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logData),
        });
      } else {
        await fetch("/api/cycle-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logData),
        });
      }

      await fetchDailyLogs();
      setShowDailyLog(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#f4a6c8", "#e8d5f2"],
      });
    } catch (error) {
      console.error("Error saving daily log:", error);
    }
  };

  const calculateNextPeriod = () => {
    if (!cycleData.lastPeriodStart) return null;
    const lastPeriod = new Date(cycleData.lastPeriodStart);
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + cycleData.cycleLength);
    return nextPeriod;
  };

  const calculateOvulation = () => {
    const nextPeriod = calculateNextPeriod();
    if (!nextPeriod) return null;
    const ovulation = new Date(nextPeriod);
    // Ovulation typically occurs 14 days before next period
    ovulation.setDate(nextPeriod.getDate() - 14);
    return ovulation;
  };

  const getDaysUntilPeriod = () => {
    const nextPeriod = calculateNextPeriod();
    if (!nextPeriod) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextPeriod.setHours(0, 0, 0, 0);
    const diff = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getCurrentCycleDay = () => {
    if (!cycleData.lastPeriodStart) return 0;
    const lastPeriod = new Date(cycleData.lastPeriodStart);
    const today = new Date();
    lastPeriod.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const daysSinceStart = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceStart % cycleData.cycleLength) + 1;
  };

  const getCurrentPhase = () => {
    if (!cycleData.lastPeriodStart) return "unknown";
    const cycleDay = getCurrentCycleDay();

    if (cycleDay <= cycleData.periodLength) return "menstruation";
    if (cycleDay <= 13) return "follicular";
    if (cycleDay >= 14 && cycleDay <= 16) return "ovulation";
    return "luteal";
  };

  const getPhaseInfo = (phase: string) => {
    const phaseData = {
      menstruation: {
        emoji: "🌸",
        color: "pink",
        message: "Rest & restore. Your body is doing amazing work.",
        tips: "Stay hydrated, use a heating pad for cramps, get extra rest",
      },
      follicular: {
        emoji: "🌱",
        color: "green",
        message: "Rising energy! Perfect time for new challenges.",
        tips: "Great time to start new projects, high energy for workouts",
      },
      ovulation: {
        emoji: "✨",
        color: "purple",
        message: "Peak energy & glow! You're absolutely radiant.",
        tips: "Most fertile days, peak confidence and communication",
      },
      luteal: {
        emoji: "🌙",
        color: "blue",
        message: "Nurture yourself. Self-care is your priority.",
        tips: "Focus on gentle activities, manage PMS symptoms, rest more",
      },
      unknown: {
        emoji: "💗",
        color: "pink",
        message: "Track your cycle to get personalized insights",
        tips: "Set up your cycle tracking to receive helpful tips",
      },
    };
    return phaseData[phase as keyof typeof phaseData];
  };

  const isPeriodDay = (date: Date) => {
    if (!cycleData.lastPeriodStart) return false;
    const lastPeriod = new Date(cycleData.lastPeriodStart);
    lastPeriod.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((date.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = ((diff % cycleData.cycleLength) + cycleData.cycleLength) % cycleData.cycleLength;
    return cycleDay < cycleData.periodLength;
  };

  const isFertileDay = (date: Date) => {
    const ovulation = calculateOvulation();
    if (!ovulation) return false;
    ovulation.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((date.getTime() - ovulation.getTime()) / (1000 * 60 * 60 * 24));
    // Fertile window: 5 days before ovulation + ovulation day
    return diff >= -5 && diff <= 0;
  };

  const isOvulationDay = (date: Date) => {
    const ovulation = calculateOvulation();
    if (!ovulation) return false;
    ovulation.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === ovulation.getTime();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPeriod = isPeriodDay(date);
      const isFertile = isFertileDay(date);
      const isOvulation = isOvulationDay(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center rounded-full text-sm relative transition-all ${
            isToday ? "ring-2 ring-pink-400 font-bold" : ""
          } ${isPeriod ? "bg-pink-200 text-pink-900" : ""} ${
            isFertile && !isPeriod ? "bg-emerald-100 text-emerald-900" : ""
          } ${isOvulation ? "bg-purple-200 text-purple-900 font-bold" : ""}`}
        >
          {day}
          {isPeriod && <span className="absolute -bottom-1 text-xs">🌸</span>}
          {isFertile && !isPeriod && <span className="absolute -bottom-1 text-xs">💚</span>}
          {isOvulation && <span className="absolute -top-1 text-xs">✨</span>}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 border-pink-200">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-pink-200 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-pink-200 rounded w-3/4"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const nextPeriod = calculateNextPeriod();
  const daysUntil = getDaysUntilPeriod();
  const phase = getCurrentPhase();
  const phaseInfo = getPhaseInfo(phase);
  const cycleDay = getCurrentCycleDay();

  if (!isSetup) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 border-pink-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Flower2 className="w-5 h-5" />
            Cycle Tracker 🌸
          </CardTitle>
          <CardDescription>Let's set up your personalized cycle tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="lastPeriod" className="text-sm font-semibold">
              When did your last period start?
            </Label>
            <Input
              id="lastPeriod"
              type="date"
              value={cycleData.lastPeriodStart}
              onChange={(e) => setCycleData({ ...cycleData, lastPeriodStart: e.target.value })}
              className="bg-white border-pink-200"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodLength" className="text-sm font-semibold">
                Period length (days)
              </Label>
              <Input
                id="periodLength"
                type="number"
                min="3"
                max="10"
                value={cycleData.periodLength}
                onChange={(e) => setCycleData({ ...cycleData, periodLength: parseInt(e.target.value) })}
                className="bg-white border-pink-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycleLength" className="text-sm font-semibold">
                Cycle length (days)
              </Label>
              <Input
                id="cycleLength"
                type="number"
                min="21"
                max="40"
                value={cycleData.cycleLength}
                onChange={(e) => setCycleData({ ...cycleData, cycleLength: parseInt(e.target.value) })}
                className="bg-white border-pink-200"
              />
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
            <p className="text-xs text-pink-800">
              <Info className="w-3 h-3 inline mr-1" />
              Average cycle: 28 days | Average period: 5 days
            </p>
          </div>

          <Button
            onClick={() => saveCycleData(cycleData)}
            disabled={!cycleData.lastPeriodStart}
            className="w-full bg-pink-500 hover:bg-pink-600"
          >
            <Flower2 className="w-4 h-4 mr-2" />
            Start Tracking
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showCalendar) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 border-pink-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Calendar className="w-5 h-5" />
            Cycle Calendar
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">{renderCalendar()}</div>

          <div className="space-y-2 text-xs bg-white/60 rounded-lg p-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center">🌸</div>
              <span className="text-pink-900 font-medium">Period days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">💚</div>
              <span className="text-emerald-900 font-medium">Fertile window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center">✨</div>
              <span className="text-purple-900 font-medium">Ovulation day</span>
            </div>
          </div>

          <Button onClick={() => setShowCalendar(false)} variant="outline" className="w-full mt-4">
            Back to Overview
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showDailyLog) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 border-pink-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Heart className="w-5 h-5" />
            Daily Check-in
          </CardTitle>
          <CardDescription>How are you feeling today?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/60 backdrop-blur rounded-lg p-4 space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              Symptoms
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cramps"
                  checked={todayLog.cramps}
                  onCheckedChange={(checked) => setTodayLog({ ...todayLog, cramps: checked as boolean })}
                />
                <label htmlFor="cramps" className="text-sm cursor-pointer">
                  Cramps
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="headache"
                  checked={todayLog.headache}
                  onCheckedChange={(checked) => setTodayLog({ ...todayLog, headache: checked as boolean })}
                />
                <label htmlFor="headache" className="text-sm cursor-pointer">
                  Headache
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cravings"
                  checked={todayLog.cravings}
                  onCheckedChange={(checked) => setTodayLog({ ...todayLog, cravings: checked as boolean })}
                />
                <label htmlFor="cravings" className="text-sm cursor-pointer">
                  Cravings 🍫
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-lg p-4 space-y-2">
            <Label className="text-sm font-semibold">Flow Level</Label>
            <div className="grid grid-cols-4 gap-2">
              {["none", "light", "medium", "heavy"].map((level) => (
                <Button
                  key={level}
                  variant={todayLog.flowLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTodayLog({ ...todayLog, flowLevel: level })}
                  className={`capitalize ${todayLog.flowLevel === level ? "bg-pink-500 hover:bg-pink-600" : ""}`}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-lg p-4 space-y-2">
            <Label className="text-sm font-semibold">Mood</Label>
            <div className="flex gap-2 justify-between">
              {[
                { emoji: "😊", value: "happy" },
                { emoji: "😐", value: "neutral" },
                { emoji: "😔", value: "sad" },
                { emoji: "😤", value: "irritated" },
                { emoji: "😴", value: "tired" },
              ].map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setTodayLog({ ...todayLog, mood: mood.value })}
                  className={`p-2 text-2xl rounded-lg transition-all ${
                    todayLog.mood === mood.value ? "bg-pink-200 scale-110 shadow-md" : "opacity-50 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-lg p-4 space-y-2">
            <Label className="text-sm font-semibold">Energy Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {["low", "normal", "high"].map((energy) => (
                <Button
                  key={energy}
                  variant={todayLog.energy === energy ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTodayLog({ ...todayLog, energy })}
                  className={`capitalize ${todayLog.energy === energy ? "bg-purple-500 hover:bg-purple-600" : ""}`}
                >
                  {energy}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveDailyLog} className="flex-1 bg-pink-500 hover:bg-pink-600">
              <Heart className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={() => setShowDailyLog(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 border-pink-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-700">
          <Flower2 className="w-5 h-5" />
          Cycle Tracker
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <span className="text-xl">{phaseInfo.emoji}</span>
          <span>{phaseInfo.message}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase Progress */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current Phase</p>
              <p className="font-bold text-lg capitalize text-pink-700">{phase}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Cycle Day</p>
              <p className="font-bold text-lg text-purple-700">
                {cycleDay} / {cycleData.cycleLength}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress value={(cycleDay / cycleData.cycleLength) * 100} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {Math.round((cycleDay / cycleData.cycleLength) * 100)}% through cycle
            </p>
          </div>
        </div>

        {/* Next Period Prediction */}
        {nextPeriod && daysUntil !== null && (
          <div className={`rounded-2xl p-4 ${
            daysUntil <= 3 && daysUntil > 0
              ? "bg-pink-100 border-2 border-pink-300"
              : "bg-white/70 backdrop-blur"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Next Period</p>
                <p className="font-semibold text-pink-700">
                  {nextPeriod.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-pink-600">
                  {daysUntil > 0 ? daysUntil : daysUntil === 0 ? "Today" : "Soon"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {daysUntil > 0 ? "days away" : ""}
                </p>
              </div>
            </div>
            {daysUntil <= 3 && daysUntil > 0 && (
              <p className="text-sm text-pink-800 mt-2 text-center">
                🌸 Your period is coming soon. Be extra kind to yourself!
              </p>
            )}
          </div>
        )}

        {/* Tips for current phase */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <p className="text-sm font-semibold text-purple-700">Phase Tips</p>
          </div>
          <p className="text-xs text-muted-foreground">{phaseInfo.tips}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setShowCalendar(true)} variant="outline" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button onClick={() => setShowDailyLog(true)} className="w-full bg-pink-500 hover:bg-pink-600">
            <Heart className="w-4 h-4 mr-2" />
            Log Today
          </Button>
        </div>

        {/* Insights */}
        {dailyLogs.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 space-y-2 border border-purple-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-700">
              <TrendingUp className="w-4 h-4" />
              Insights
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>📊 {dailyLogs.length} days logged</p>
              {dailyLogs.filter((l) => l.cramps === 1).length > 0 && (
                <p>💫 Cramps logged {dailyLogs.filter((l) => l.cramps === 1).length} times - stay hydrated!</p>
              )}
              {dailyLogs.filter((l) => l.mood === "happy").length > 0 && (
                <p>✨ {dailyLogs.filter((l) => l.mood === "happy").length} happy days tracked!</p>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={async () => {
            if (cycleData.id) {
              await fetch(`/api/cycle-data?id=${cycleData.id}`, { method: "DELETE" });
            }
            setIsSetup(false);
            setCycleData({ lastPeriodStart: "", periodLength: 5, cycleLength: 28 });
          }}
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-pink-700"
        >
          Reset Tracking
        </Button>
      </CardContent>
    </Card>
  );
}