'use client';

export default function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus-visible-only:fixed focus-visible-only:left-3 focus-visible-only:top-3 focus-visible-only:z-[1000] focus-visible-only:rounded-lg focus-visible-only:bg-black focus-visible-only:px-3 focus-visible-only:py-2 focus-visible-only:text-white"
    >
      メイン内容へスキップ
    </a>
  );
}
