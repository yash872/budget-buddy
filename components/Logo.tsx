interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Budget Buddy mark: a friendly rounded wallet with a sparkle "coin" —
 * reads as "money, but approachable" rather than a generic finance icon.
 */
export default function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bb-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect x="2" y="9" width="36" height="26" rx="8" fill="url(#bb-logo-grad)" />
      <path
        d="M2 15c0-3.314 2.686-6 6-6h24c3.314 0 6 2.686 6 6v2H2v-2z"
        fill="#ffffff"
        fillOpacity="0.25"
      />
      <circle cx="28" cy="22" r="5" fill="#ffffff" />
      <circle cx="28" cy="22" r="2" fill="#0d9488" />
      <path
        d="M9 29h8"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M31 5.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z"
        fill="#fbbf24"
      />
    </svg>
  );
}
