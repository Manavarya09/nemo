"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Heart, Image as ImageIcon, X, Trash2, Loader2, AlertCircle, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
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
  "Radiating confidence and beauty! 💅",
  "You're a total star! ⭐",
  "Looking fierce and fabulous! 🔥",
  "Your positive vibes are everything! 🌻",
  "Absolutely stunning, bestie! 💗",
];

interface Photo {
  id: number;
  date: string;
  photoData: string;
  compliment: string;
  createdAt: string;
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
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
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
      setError(null);
      const response = await fetch("/api/photos?limit=50");
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError("Failed to load photos. Please try again.");
    }
  };

  const openCamera = async () => {
    setCameraError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const message = "Camera access is not supported on this device or browser.";
      setCameraError(message);
      toast.error(message);
      return;
    }

    stopCamera();

    const constraintsList: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      { video: true, audio: false },
    ];

    let stream: MediaStream | null = null;
    let lastError: unknown;

    for (const constraints of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!stream) {
      console.error("Error accessing camera:", lastError);
      setCameraError("Unable to access camera. Please check permissions and try again.");
      toast.error("Camera access denied");
      return;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      streamRef.current = stream;

      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Error starting video playback:", error);
      }

      setIsCameraOpen(true);
      setCameraError(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setIsSnapping(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        // Mirror the image horizontally for selfie effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL("image/jpeg", 0.85);
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
      
      setTimeout(() => setIsSnapping(false), 100);
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
        toast.success("Photo saved! You look amazing! 💖");
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f4a6c8', '#e8d5f2']
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save photo");
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      toast.error("Something went wrong. Please try again.");
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
        toast.success("Photo deleted");
      } else {
        toast.error("Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.photoData;
    link.download = `herspace-${new Date(photo.date).toLocaleDateString()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Photo downloaded! 📸");
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowCompliment(false);
    openCamera();
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
        month: "long", 
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
      });
    }
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {selectedPhoto ? (
          <div className="space-y-4">
            <img
              src={selectedPhoto.photoData}
              alt="Your photo"
              className="w-full rounded-lg shadow-lg"
            />
            <div className="bg-white/80 backdrop-blur p-4 rounded-lg">
              <p className="text-fuchsia-900 font-semibold mb-2 text-center">{selectedPhoto.compliment}</p>
              <p className="text-xs text-center text-muted-foreground">
                {formatDate(selectedPhoto.date)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPhoto(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadPhoto(selectedPhoto)}
                className="flex-1"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletePhoto(selectedPhoto.id)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {photos.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-4xl">📸</p>
                <p className="text-muted-foreground">No photos yet.</p>
                <p className="text-sm text-fuchsia-700">Start capturing beautiful moments!</p>
              </div>
            ) : (
              <>
                <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-fuchsia-800 text-center">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    {photos.length} beautiful {photos.length === 1 ? "moment" : "moments"} captured
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-all hover:scale-105 shadow-md"
                    >
                      <img
                        src={photo.photoData}
                        alt="Your photo"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
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
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={capturedPhoto}
              alt="Captured"
              className="w-full"
            />
          </div>
          
          {showCompliment && (
            <div className="animate-fade-in bg-gradient-to-r from-fuchsia-100 to-pink-100 p-5 rounded-lg text-center border-2 border-fuchsia-200 shadow-md">
              <Sparkles className="w-10 h-10 text-fuchsia-500 mx-auto mb-3 animate-pulse" />
              <p className="text-lg font-bold text-fuchsia-900 leading-relaxed">
                {compliment}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={savePhoto}
              disabled={loading}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Save Photo
                </>
              )}
            </Button>
            <Button
              onClick={retakePhoto}
              variant="outline"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
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

        {cameraError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600">{cameraError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className={`relative rounded-lg overflow-hidden bg-black ${isSnapping ? 'animate-pulse' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full mirror"
            />
            <div className="absolute inset-0 pointer-events-none border-4 border-fuchsia-200/30 rounded-lg"></div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-3">
            <p className="text-xs text-center text-fuchsia-800">
              <Sparkles className="w-3 h-3 inline mr-1" />
              You're looking absolutely gorgeous!
            </p>
          </div>
          
          <Button
            onClick={capturePhoto}
            disabled={isSnapping}
            className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white h-12 text-base"
          >
            <Camera className="w-5 h-5 mr-2" />
            {isSnapping ? "Capturing..." : "Capture Photo"}
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

      <div className="text-center mb-4 py-8">
        <div className="text-7xl animate-bounce mb-3">📸</div>
        <p className="text-sm text-fuchsia-700 font-medium">
          Capture your beautiful moments and get uplifting compliments!
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={openCamera}
          className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white h-12"
        >
          <Camera className="w-5 h-5 mr-2" />
          Open Camera
        </Button>

        {photos.length > 0 && (
          <Button
            onClick={() => setShowGallery(true)}
            variant="outline"
            className="w-full border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-50"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            View Gallery ({photos.length})
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <p className="text-xs text-center mt-4 text-fuchsia-700">
        You're beautiful, always! 💝
      </p>
    </Card>
  );
}
