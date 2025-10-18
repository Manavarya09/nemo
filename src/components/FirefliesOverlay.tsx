"use client";

import { useEffect, useState } from "react";

export default function FirefliesOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setShow(h >= 19 || h <= 6);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 hidden dark:block">
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-yellow-300 opacity-70 animate-[firefly_9s_linear_infinite]"
            style={{
              left: `${Math.random()*100}%`,
              top: `${Math.random()*100}%`,
              animationDelay: `${Math.random()*6}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes firefly {
          0%, 100% { transform: translate(0,0); opacity: .2 }
          25% { transform: translate(10px, -12px); opacity: .9 }
          50% { transform: translate(-6px, 8px); opacity: .4 }
          75% { transform: translate(8px, 4px); opacity: .8 }
        }
      `}</style>
    </div>
  );
}
