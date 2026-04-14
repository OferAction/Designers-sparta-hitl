export const TempEdgeGradient: React.FC = () => (
  <svg className="absolute size-0">
    <defs>
      <linearGradient id="temp-edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0" stopColor="hsl(var(--border))" stopOpacity="0.5" />
        <stop offset="0.528846" stopColor="hsl(var(--border))" stopOpacity="0.2" />
        <stop offset="1" stopColor="hsl(var(--border))" stopOpacity="0.5" />
      </linearGradient>
    </defs>
  </svg>
);
