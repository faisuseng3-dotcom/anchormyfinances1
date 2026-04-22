// HSL Color Wheel — circular gradient picker
import React, { useRef, useCallback } from 'react';

export default function ColorWheel({ value, onChange, size = 180 }) {
  const canvasRef = useRef(null);
  const cx = size / 2;
  const ringW = size * 0.18;
  const outerR = size / 2;
  const innerR = outerR - ringW;

  const getColorFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cx;
    const dist = Math.sqrt(x * x + y * y);
    if (dist < innerR || dist > outerR) return;
    const angle = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    const saturation = Math.min(100, ((dist - innerR) / ringW) * 100 + 60);
    const h = Math.round(angle);
    const s = Math.round(saturation);
    onChange?.(hslToHex(h, s, 55));
  }, [cx, innerR, outerR, ringW, onChange]);

  const stops = Array.from({ length: 360 }, (_, i) => i);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ cursor: 'crosshair' }}
        ref={canvasRef}
        onMouseDown={getColorFromEvent}
        onMouseMove={e => e.buttons === 1 && getColorFromEvent(e)}
        onTouchStart={getColorFromEvent}
        onTouchMove={getColorFromEvent}
      >
        <defs>
          {stops.map(deg => (
            <linearGradient key={deg} id={`cw_${deg}`}
              x1={Math.cos((deg * Math.PI) / 180) * 0.5 + 0.5}
              y1={Math.sin((deg * Math.PI) / 180) * 0.5 + 0.5}
              x2={Math.cos(((deg + 180) * Math.PI) / 180) * 0.5 + 0.5}
              y2={Math.sin(((deg + 180) * Math.PI) / 180) * 0.5 + 0.5}
            >
              <stop offset="0%" stopColor={`hsl(${deg},90%,55%)`} />
              <stop offset="100%" stopColor={`hsl(${(deg + 180) % 360},90%,55%)`} />
            </linearGradient>
          ))}
          <radialGradient id="cw_white" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        {/* Hue ring segments */}
        {Array.from({ length: 60 }, (_, i) => {
          const startDeg = i * 6;
          const endDeg = startDeg + 6.5;
          const toR = (d) => (d * Math.PI) / 180;
          const x1o = cx + outerR * Math.cos(toR(startDeg));
          const y1o = cx + outerR * Math.sin(toR(startDeg));
          const x2o = cx + outerR * Math.cos(toR(endDeg));
          const y2o = cx + outerR * Math.sin(toR(endDeg));
          const x1i = cx + innerR * Math.cos(toR(startDeg));
          const y1i = cx + innerR * Math.sin(toR(startDeg));
          const x2i = cx + innerR * Math.cos(toR(endDeg));
          const y2i = cx + innerR * Math.sin(toR(endDeg));
          return (
            <path
              key={i}
              d={`M ${x1o} ${y1o} A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerR} ${innerR} 0 0 0 ${x1i} ${y1i} Z`}
              fill={`hsl(${startDeg + 3}, 90%, 55%)`}
            />
          );
        })}

        {/* Subtle white overlay for saturation feel */}
        <circle cx={cx} cy={cx} r={outerR} fill="url(#cw_white)" />

        {/* Dark center */}
        <circle cx={cx} cy={cx} r={innerR} fill="#1a2332" />
        <circle cx={cx} cy={cx} r={innerR * 0.55} fill="#131b27" />

        {/* Selected color dot */}
        {value && (() => {
          const hsl = hexToHsl(value);
          if (!hsl) return null;
          const angle = (hsl.h * Math.PI) / 180;
          const r = innerR + (ringW * Math.min(hsl.s, 100)) / 100;
          const px = cx + r * Math.cos(angle);
          const py = cx + r * Math.sin(angle);
          return (
            <>
              <circle cx={px} cy={py} r={10} fill={value} stroke="white" strokeWidth="2.5" />
              <circle cx={px} cy={py} r={5} fill="white" opacity="0.4" />
            </>
          );
        })()}
      </svg>
    </div>
  );
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
  if (!hex || hex.length < 7) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
    h *= 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}