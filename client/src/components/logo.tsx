export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="The 21 Bitcoin"
    >
      {/* Hexagonal stamp */}
      <path
        d="M20 2 L35.32 11 L35.32 29 L20 38 L4.68 29 L4.68 11 Z"
        fill="hsl(28 95% 58%)"
      />
      {/* Inner mark: stylized "21" */}
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="14"
        fontWeight="800"
        fill="hsl(25 15% 6%)"
        letterSpacing="-0.5"
      >
        21
      </text>
      {/* Accent tick marks */}
      <line x1="8" y1="20" x2="11" y2="20" stroke="hsl(25 15% 6%)" strokeWidth="1.5" />
      <line x1="29" y1="20" x2="32" y2="20" stroke="hsl(25 15% 6%)" strokeWidth="1.5" />
    </svg>
  );
}
