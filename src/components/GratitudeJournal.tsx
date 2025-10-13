"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookHeart, Trash2, Edit, Loader2, AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface GratitudeEntry {
  id: number;
  date: string;
  entryText: string;
  createdAt: string;
}

export default function GratitudeJournal() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setError(null);
      const response = await fetch("/api/gratitude?limit=50");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        throw new Error("Failed to fetch entries");
      }
    } catch (error) {
      console.error("Error fetching gratitude entries:", error);
      setError("Failed to load entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!entry.trim()) {
      toast.error("Please write something you're grateful for 💕");
      return;
    }

    setSaving(true);
    const date = new Date().toISOString();
    
    try {
      const response = await fetch("/api/gratitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, entryText: entry.trim() }),
      });
      
      if (response.ok) {
        await fetchEntries();
        setEntry("");
        toast.success("Gratitude saved! 💚");
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#6ee7b7"],
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save entry");
      }
    } catch (error) {
      console.error("Error adding gratitude entry:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateEntry = async (id: number) => {
    if (!editText.trim()) {
      toast.error("Entry cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/gratitude?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryText: editText.trim() }),
      });
      
      if (response.ok) {
        await fetchEntries();
        setEditingId(null);
        setEditText("");
        toast.success("Entry updated! ✨");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update entry");
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this gratitude entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/gratitude?id=${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchEntries();
        toast.success("Entry deleted");
      } else {
        toast.error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const startEditing = (entry: GratitudeEntry) => {
    setEditingId(entry.id);
    setEditText(entry.entryText);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
      });
    }
  };

  const getStreakCount = () => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const streak = getStreakCount();

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
      <div className="flex items-center gap-2 mb-4">
        <BookHeart className="w-6 h-6 text-emerald-600" />
        <h3 className="text-lg font-semibold text-emerald-900">Gratitude Journal</h3>
        <Sparkles className="w-4 h-4 text-emerald-500 ml-auto animate-pulse" />
      </div>

      {/* Streak Counter */}
      {streak > 0 && (
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg p-3 mb-4 border border-emerald-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-700 font-medium">Daily Streak</p>
              <p className="text-2xl font-bold text-emerald-900">{streak} {streak === 1 ? "day" : "days"} 🔥</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700">Keep it going!</p>
            </div>
          </div>
        </div>
      )}

      {/* Entry Input */}
      <div className="bg-white/60 backdrop-blur rounded-lg p-4 mb-4 space-y-3">
        <Textarea
          placeholder="What are you grateful for today? ✨"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          className="resize-none border-emerald-200 bg-white"
          rows={3}
          disabled={saving}
        />

        <Button
          onClick={addEntry}
          disabled={saving || !entry.trim()}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save Moment 💚
            </>
          )}
        </Button>
      </div>

      {/* Entries List */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {/* Stats */}
          <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-emerald-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-2">
              <TrendingUp className="w-4 h-4" />
              Your Progress
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-emerald-50 rounded">
                <p className="font-bold text-emerald-900">{entries.length}</p>
                <p className="text-emerald-700">Total Entries</p>
              </div>
              <div className="text-center p-2 bg-teal-50 rounded">
                <p className="font-bold text-teal-900">{streak}</p>
                <p className="text-teal-700">Day Streak</p>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="w-full text-emerald-700 hover:text-emerald-900 border-emerald-300"
          >
            {showAll ? "Hide" : "Show"} Past Entries ({entries.length})
          </Button>
          
          {/* Entries */}
          {showAll && (
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {entries.map((e) => (
                <div 
                  key={e.id} 
                  className="p-4 bg-white rounded-lg border border-emerald-200 text-sm transition-all hover:shadow-md"
                >
                  {editingId === e.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="resize-none border-emerald-200"
                        rows={3}
                        disabled={saving}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateEntry(e.id)}
                          disabled={saving || !editText.trim()}
                          size="sm"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        >
                          {saving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          disabled={saving}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs text-emerald-600 font-medium">
                          {formatDate(e.date)}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => startEditing(e)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-900"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => deleteEntry(e.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-emerald-900 leading-relaxed">{e.entryText}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-6 space-y-2">
          <p className="text-2xl">📝</p>
          <p className="text-sm text-emerald-700">
            Start your gratitude journey today!
          </p>
        </div>
      )}

      <p className="text-xs text-center mt-4 text-emerald-700">
        Celebrating you every day! ✨
      </p>
    </Card>
  );
}