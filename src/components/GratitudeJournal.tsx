"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookHeart } from "lucide-react";

export default function GratitudeJournal() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/gratitude?limit=10");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Error fetching gratitude entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (entry.trim()) {
      const date = new Date().toISOString().split("T")[0];
      
      try {
        const response = await fetch("/api/gratitude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, entryText: entry }),
        });
        
        if (response.ok) {
          await fetchEntries();
          setEntry("");
        }
      } catch (error) {
        console.error("Error adding gratitude entry:", error);
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <div className="animate-pulse">
          <div className="h-6 bg-emerald-200 rounded mb-4 w-1/2"></div>
          <div className="h-20 bg-emerald-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
      <div className="flex items-center gap-2 mb-4">
        <BookHeart className="w-6 h-6 text-emerald-600" />
        <h3 className="text-lg font-semibold text-emerald-900">Gratitude Journal</h3>
      </div>

      <Textarea
        placeholder="What are you grateful for today? 🌸"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        className="mb-3 resize-none border-emerald-200"
        rows={3}
      />

      <Button
        onClick={addEntry}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mb-4"
      >
        Save Moment 💚
      </Button>

      {entries.length > 0 && (
        <div className="space-y-2">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="ghost"
            className="w-full text-emerald-700 hover:text-emerald-900"
          >
            {showAll ? "Hide" : "Show"} Past Entries ({entries.length})
          </Button>
          
          {showAll && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="p-3 bg-white rounded-lg border border-emerald-200 text-sm text-emerald-900">
                  {e.entryText}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-center mt-3 text-emerald-700">
        Celebrating you every day! ✨
      </p>
    </Card>
  );
}