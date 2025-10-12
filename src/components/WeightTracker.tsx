"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function WeightTracker() {
  const [weight, setWeight] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeightData();
  }, []);

  const fetchWeightData = async () => {
    try {
      const response = await fetch("/api/weight?limit=20");
      if (response.ok) {
        const logs = await response.json();
        setData(logs.reverse());
      }
    } catch (error) {
      console.error("Error fetching weight data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (weight) {
      const weekLabel = `Week ${data.length + 1}`;
      const date = new Date().toISOString().split("T")[0];

      try {
        const response = await fetch("/api/weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            weight: parseFloat(weight),
            weekLabel,
          }),
        });

        if (response.ok) {
          await fetchWeightData();
          setWeight("");
        }
      } catch (error) {
        console.error("Error adding weight entry:", error);
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200">
        <div className="animate-pulse">
          <div className="h-6 bg-rose-200 rounded mb-4 w-1/2"></div>
          <div className="h-40 bg-rose-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
        <h3 className="text-lg font-semibold text-rose-900">Progress Tracker</h3>
      </div>

      {data.length > 0 && (
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="weekLabel" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ fill: "#f43f5e", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={addEntry}
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          Add
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-rose-700">
        <TrendingDown className="w-4 h-4" />
        <p className="text-sm font-medium">
          You're doing amazing! So proud of you! 💪✨
        </p>
      </div>
    </Card>
  );
}