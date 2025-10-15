"use client";

import { CSSProperties, useMemo } from "react";

type OptionWheelProps = {
  options: string[];
  rotation: number;
  palette: string[];
  pointerColor: string;
  labelColor: string;
  size?: number;
};

export function OptionWheel({
  options,
  rotation,
  palette,
  pointerColor,
  labelColor,
  size = 240,
}: OptionWheelProps) {
  const gradientStops = useMemo(() => {
    if (options.length === 0) {
      return "#ffffff 0deg 360deg";
    }

    const segmentAngle = 360 / options.length;

    return options
      .map((_, index) => {
        const start = index * segmentAngle;
        const end = (index + 1) * segmentAngle;
        const color = palette[index % palette.length];
        return `${color} ${start}deg ${end}deg`;
      })
      .join(", ");
  }, [options, palette]);

  const labelAngles = useMemo(() => {
    if (options.length === 0) {
      return [];
    }

    const segmentAngle = 360 / options.length;
    return options.map((_, index) => index * segmentAngle + segmentAngle / 2);
  }, [options]);

  const wheelStyle: CSSProperties = {
    "--wheel-rotation": `${rotation}deg`,
    "--wheel-gradient": gradientStops,
    "--wheel-size": `${size}px`,
    "--wheel-text-color": labelColor,
  } as CSSProperties;

  const pointerStyle: CSSProperties = {
    "--pointer-color": pointerColor,
  } as CSSProperties;

  return (
    <div className="option-wheel-container">
      <div className="option-wheel-pointer" style={pointerStyle} />
      <div className="option-wheel-disc" style={wheelStyle}>
        <div className="option-wheel-center" />
        {options.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="option-wheel-label"
            style={{ "--label-angle": `${labelAngles[index]}deg` } as CSSProperties}
          >
            <span className="option-wheel-text">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
