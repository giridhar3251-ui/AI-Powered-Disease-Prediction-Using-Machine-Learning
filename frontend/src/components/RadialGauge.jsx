import React from 'react';

export default function RadialGauge({ value = 0, size = 160, strokeWidth = 12, label = "Confidence" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  let color = "#10b981"; // Emerald
  let glowColor = "rgba(16, 185, 129, 0.4)";
  if (normalizedValue < 50) {
    color = "#f59e0b"; // Amber
    glowColor = "rgba(245, 158, 11, 0.4)";
  }
  if (normalizedValue < 30) {
    color = "#f43f5e"; // Rose
    glowColor = "rgba(244, 63, 94, 0.4)";
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Value Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 8px ${glowColor})`
          }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: `${size * 0.22}px`, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {normalizedValue}%
        </span>
        <span style={{ fontSize: `${size * 0.085}px`, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginTop: '4px', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
    </div>
  );
}
