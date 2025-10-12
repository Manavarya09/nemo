"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Heart, Image as ImageIcon, X, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";

const compliments = [
  "Your smile is absolutely radiant! ✨",
  "You're glowing today, gorgeous! 🌟",
  "That confidence looks amazing on you! 💫",
  "You're stunning inside and out! 💖",
  "Your energy is magnetic! ⚡",
  "You look like a dream! 🌸",
  "Absolutely breathtaking! 🦋",
  "You're a work of art! 🎨",
  "Pure beauty right here! 💕",
  "You're absolutely perfect! 👑",
  "Your kindness shines through! 💝",
  "You're one of a kind! 🌺",
  "Absolutely gorgeous, as always! ✨",
  "Your smile brightens the whole room! 🌞",
  "You're absolutely incredible! 🌈",
];

interface Photo {
  id: number;
  date: string;
  photoData: string;
  compliment: string;
}

export default function ComplimentCamera() {
  const [compliment, setCompliment] = useState("");
  const [showCompliment, setShowCompliment] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchPhotos();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos?limit=20");
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedPhoto(photoData);
        
        // Generate compliment
        const random = compliments[Math.floor(Math.random() * compliments.length)];
        setCompliment(random);
        setShowCompliment(true);
        
        stopCamera();
        
        // Confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f4a6c8', '#e8d5f2', '#c8e6f5', '#ffd4a3']
        });
      }
    }
  };

  const savePhoto = async () => {
    if (!capturedPhoto || !compliment) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          photoData: capturedPhoto,
          compliment: compliment,
        }),
      });

      if (response.ok) {
        await fetchPhotos();
        setCapturedPhoto(null);
        setShowCompliment(false);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f4a6c8', '#e8d5f2']
        });
      }
    } catch (error) {
      console.error("Error saving photo:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (id: number) => {
    try {
      const response = await fetch(`/api/photos?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPhotos();
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowCompliment(false);
    openCamera();
  };

  if (showGallery) {
    return (
      <Card className="p-6 bg-gradient-to-br from-fuchsia-50 to-pink-50 border-2 border-fuchsia-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-fuchsia-600" />
            <h3 className="text-lg font-semibold text-fuchsia-900">Your Beautiful Moments</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowGallery(false);
              setSelectedPhoto(null);
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {selectedPhoto ? (
          <div className="space-y-4">
            <img
              src={selectedPhoto.photoData}
              alt="Your photo"
              className="w-full rounded-lg"
            />
            <div className="bg-white/80 p-4 rounded-lg">
              <p className="text-fuchsia-900 font-semibold mb-2">{selectedPhoto.compliment}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPhoto(null)}
                className="flex-1"
              >
                Back to Gallery
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletePhoto(selectedPhoto.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {photos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No photos yet. Start capturing beautiful moments! 📸</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={photo.photoData}
                      alt="Your photo"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }

  if (capturedPhoto) {
    return (
      <Card className="p-6 bg-gradient-to-br from-fuchsia-50 to-pink-50 border-2 border-fuchsia-200">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-6 h-6 text-fuchsia-600" />
          <h3 className="text-lg font-semibold text-fuchsia-900">Your Beautiful Moment</h3>
        </div>

        <div className="space-y-4">
          <img
            src={capturedPhoto}
            alt="Captured"
            className="w-full rounded-lg"
          />
          
          {showCompliment && (
            <div className="animate-fade-in bg-white/80 p-4 rounded-lg text-center">
              <Sparkles className="w-8 h-8 text-fuchsia-500 mx-auto mb-2 animate-pulse" />
              <p className="text-lg font-semibold text-fuchsia-900">
                {compliment}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={savePhoto}
              disabled={loading}
              className="flex-1 bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Photo"}
            </Button>
            <Button
              onClick={retakePhoto}
              variant="outline"
              className="flex-1"
            >
              Retake
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isCameraOpen) {
    return (
      <Card className="p-6 bg-gradient-to-br from-fuchsia-50 to-pink-50 border-2 border-fuchsia-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-fuchsia-600" />
            <h3 className="text-lg font-semibold text-fuchsia-900">Smile! 📸</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={stopCamera}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full mirror"
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          
          <Button
            onClick={capturePhoto}
            className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-fuchsia-50 to-pink-50 border-2 border-fuchsia-200 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-6 h-6 text-fuchsia-600" />
        <h3 className="text-lg font-semibold text-fuchsia-900">Compliment Camera</h3>
        <Heart className="w-4 h-4 text-fuchsia-500 ml-auto animate-pulse" />
      </div>

      <div className="text-center mb-4 min-h-[120px] flex items-center justify-center">
        <div className="text-7xl animate-bounce">📸</div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={openCamera}
          className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
        >
          <Camera className="w-4 h-4 mr-2" />
          Open Camera
        </Button>

        {photos.length > 0 && (
          <Button
            onClick={() => setShowGallery(true)}
            variant="outline"
            className="w-full"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            View Gallery ({photos.length})
          </Button>
        )}
      </div>

      <p className="text-xs text-center mt-3 text-fuchsia-700">
        You're beautiful, always! 💝
      </p>
    </Card>
  );
}