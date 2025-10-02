export type PersonIllustrationProps = {
  size?: number;
};

export default function PersonIllustration({ size = 140 }: PersonIllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <linearGradient id="person-illustration-gradient" x1="0" x2="1">
          <stop offset="0" stopColor="#4A90E2" />
          <stop offset="1" stopColor="#50E3C2" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill="url(#person-illustration-gradient)" opacity="0.09" />
      <circle cx="80" cy="58" r="26" fill="#ffffff" stroke="#111827" strokeWidth="2" />
      <path d="M32 120c9-18 28-28 48-28s39 10 48 28" fill="#ffffff" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="72" cy="54" r="3" fill="#111827" />
      <circle cx="88" cy="54" r="3" fill="#111827" />
      <path d="M70 64c6 6 14 6 20 0" stroke="#F25F5C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="44" r="6" fill="#FFD166" />
      <circle cx="100" cy="44" r="6" fill="#9D59EC" />
    </svg>
  );
}
