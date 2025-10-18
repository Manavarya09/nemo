"use client";

import { useEffect, useState } from "react";

const messages = [
  "A tiny scroll floats by… you are precious 🌸",
  "Secret note: drink water and be kind to yourself 💖",
  "A whisper from the wind: you’re doing amazing ✨",
  "Small scroll, big love: you matter so much 💌",
];

import LoveLetterCard from "@/components/LoveLetterCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = { show: boolean; onClose?: () => void };

export default function FooterEasterEgg({ show, onClose }: Props) {
  return (
    <Dialog open={show} onOpenChange={(open)=>{ if(!open) onClose?.(); }}>
      <DialogContent
        className="bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 border-2 border-pink-200"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-pink-900">A little love letter 💌</DialogTitle>
        </DialogHeader>
        <LoveLetterCard />
      </DialogContent>
    </Dialog>
  );
}
