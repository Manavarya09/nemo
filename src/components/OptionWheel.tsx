"use client";

import { CSSProperties, useMemo } from "react";

export type WheelSegment = {
  label: string;
  weight?: number;
};

export type WheelSlice = {
  label: string;
  weight: number;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
};

type OptionWheelProps = {
  slices: WheelSlice[];
  rotation: number;
  palette: string[];
  pointerColor: string;
  labelColor: string;
  size?: number;
};

export function createWheelSlices(segments: WheelSegment[]): WheelSlice[] {
  const sanitized = segments
    .map((segment) => ({
      label: segment.label,
      weight: Math.max(segment.weight ?? 1, 0),
    }))
    .filter((segment) => segment.weight > 0);

  if (sanitized.length === 0) {
    return [];
  }

  const totalWeight = sanitized.reduce((sum, segment) => sum + segment.weight, 0);

  let currentAngle = 0;
  const slices: WheelSlice[] = sanitized.map((segment) => {
    const angle = (segment.weight / totalWeight) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const centerAngle = startAngle + angle / 2;
    currentAngle = endAngle;

    return {
      label: segment.label,
      weight: segment.weight,
      startAngle,
      endAngle,
      centerAngle,
    };
  });

  const lastSlice = slices[slices.length - 1];
  lastSlice.endAngle = 360;
  lastSlice.centerAngle = (lastSlice.startAngle + lastSlice.endAngle) / 2;

  return slices;
}

export function OptionWheel({
  slices,
  rotation,
  palette,
  pointerColor,
  labelColor,
  size = 240,
}: OptionWheelProps) {
  const gradientStops = useMemo(() => {
    if (slices.length === 0) {
      return "#ffffff 0deg 360deg";
    }

    return slices
      .map((slice, index) => {
        const color = palette[index % palette.length];
        return `${color} ${slice.startAngle}deg ${slice.endAngle}deg`;
      })
      .join(", ");
  }, [slices, palette]);

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
    <div className="option-wheel-container" aria-hidden>
      <div className="option-wheel-pointer" style={pointerStyle} />
      <div className="option-wheel-disc" style={wheelStyle}>
        <div
          className="option-wheel-divider"
          style={{ "--divider-count": Math.max(slices.length, 1) } as CSSProperties}
        />
        <div className="option-wheel-center" />
        {slices.map((slice, index) => (
          <div
            key={`${slice.label}-${index}`}
            className="option-wheel-label"
            style={{ "--label-angle": `${slice.centerAngle}deg` } as CSSProperties}
          >
            <span className="option-wheel-text">{slice.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
