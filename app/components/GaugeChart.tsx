"use client";

import { GaugeContainer, GaugeReferenceArc, GaugeValueArc, useGaugeState } from "@mui/x-charts/Gauge";

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  color: "default" | "meli" | "femsa" | "coracoes" | "warning" | "success";
}

const colorStyles = {
  default: { level: "#4aa3ff", text: "#f8fafc", needle: "#0a1c3a" },
  meli: { level: "#f2c400", text: "#f8fafc", needle: "#1a1300" },
  femsa: { level: "#e11d48", text: "#f8fafc", needle: "#22030b" },
  coracoes: { level: "#7a3e2e", text: "#f8fafc", needle: "#1a0b06" },
  warning: { level: "#f59e0b", text: "#f8fafc", needle: "#2a1400" },
  success: { level: "#22c55e", text: "#f8fafc", needle: "#052614" },
};

const GaugeNeedle = ({ color, outline }: { color: string; outline: string }) => {
  const { valueAngle, cx, cy, outerRadius } = useGaugeState();
  if (valueAngle === null) return null;
  const needleLength = outerRadius * 0.78;
  const needleX = cx + Math.sin(valueAngle) * needleLength;
  const needleY = cy - Math.cos(valueAngle) * needleLength;

  return (
    <g>
      <line
        x1={cx}
        y1={cy}
        x2={needleX}
        y2={needleY}
        stroke={outline}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={cx}
        y1={cy}
        x2={needleX}
        y2={needleY}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={cx} cy={cy} r={7} fill={outline} />
      <circle cx={cx} cy={cy} r={4.5} fill={color} />
    </g>
  );
};

const GaugeValueLabel = () => {
  const { value, cx, cy, outerRadius } = useGaugeState();
  if (value === null) return null;
  const y = cy + outerRadius * 0.42;
  return (
    <text
      x={cx}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="16"
      fontWeight="700"
      style={{
        fill: "#f8fafc",
        stroke: "#0b1020",
        strokeWidth: 3,
        paintOrder: "stroke",
        textRendering: "geometricPrecision",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
      }}
    >
      {Math.round(value)}
    </text>
  );
};

export const GaugeChart = ({ value, max, label, color }: GaugeChartProps) => {
  const palette = colorStyles[color];

  return (
    <div className="flex flex-col items-center">
      <GaugeContainer
        className="gauge-smooth"
        width={140}
        height={100}
        value={value}
        valueMin={0}
        valueMax={max}
        startAngle={-110}
        endAngle={110}
        innerRadius="70%"
        outerRadius="100%"
      >
        <GaugeReferenceArc style={{ fill: "var(--color-border)" }} />
        <GaugeValueArc style={{ fill: palette.level }} />
        <GaugeNeedle color="#f8fafc" outline="#0b1020" />
        <GaugeValueLabel />
      </GaugeContainer>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};
