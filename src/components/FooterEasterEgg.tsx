"use client";

import { useEffect, useState } from "react";

const messages = [
  "A tiny scroll floats by… you are precious 🌸",
  "Secret note: drink water and be kind to yourself 💖",
  "A whisper from the wind: you’re doing amazing ✨",
  "Small scroll, big love: you matter so much 💌",
];

import LoveLetterNote from "@/components/LoveLetterNote";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = { show: boolean; onClose?: () => void };

export default function FooterEasterEgg({ show, onClose }: Props) {
  return (
    <Dialog open={show} onOpenChange={(open)=>{ if(!open) onClose?.(); }}>
      <DialogContent className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <DialogHeader>
          <DialogTitle className="text-yellow-900">A little love note 💛</DialogTitle>
        </DialogHeader>
        <LoveLetterNote />
      </DialogContent>
    </Dialog>
  );
}
