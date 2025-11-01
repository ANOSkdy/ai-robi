export default function BackdropPattern() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-10">
      <svg width="100%" height="100%" role="presentation">
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}
