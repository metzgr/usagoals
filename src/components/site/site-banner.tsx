"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteBanner() {
  const [visible, setVisible] = useState(true);

  function dismissBanner() {
    document.documentElement.style.setProperty("--site-banner-height", "0px");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="relative isolate flex min-h-11 items-center gap-x-6 overflow-hidden bg-gray-800/50 px-6 py-2.5 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10 sm:px-3.5 sm:before:flex-1">
      <GlowShape className="left-[max(-7rem,calc(50%-52rem))]" />
      <GlowShape className="left-[max(45rem,calc(50%+8rem))]" />

      <p className="text-sm/6 text-gray-100">
        <Link href="/explore" className="hover:text-white">
          <strong className="font-semibold">USA Goals</strong>
          <svg
            viewBox="0 0 2 2"
            aria-hidden="true"
            className="mx-2 inline size-0.5 fill-current"
          >
            <circle r="1" cx="1" cy="1" />
          </svg>
          An AI-driven research project from Performance.gov &nbsp;
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </p>

      <div className="flex flex-1 justify-end">
        <button
          type="button"
          className="-m-3 p-3 focus-visible:-outline-offset-4"
          onClick={dismissBanner}
        >
          <span className="sr-only">Dismiss</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="size-5 text-gray-400 hover:text-gray-300"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function GlowShape({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl ${className}`}
    >
      <div
        className="aspect-[577/310] w-[577px] bg-gradient-to-r from-taupe-300 via-taupe-500 to-taupe-700 opacity-35"
        style={{
          clipPath:
            "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
        }}
      />
    </div>
  );
}
