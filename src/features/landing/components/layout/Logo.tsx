export function LandingLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 56"
      role="img"
      aria-label="EduPay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lg-fe-nav" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect x="0" y="4" width="48" height="48" rx="12" fill="url(#lg-fe-nav)" />
      <path d="M12 20h22a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H12z" fill="#ffffff" opacity="0.95" />
      <path d="M16 26h12M16 30h8" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="38" cy="18" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.6" />
      <text
        x="62"
        y="36"
        fontFamily="-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        fontSize="24"
        fontWeight={700}
        fill="currentColor"
        letterSpacing="-0.5"
      >
        EduPay
      </text>
    </svg>
  );
}
