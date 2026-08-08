'use client';

import Link from 'next/link';
import { displayFontStack, bodyFontStack } from './fonts';

const REVIEWS = [
  { name: 'Amina R.', stars: 5, text: 'Found a vendor I actually trust in five minutes.' },
  { name: 'Bilal K.', stars: 5, text: 'Reviews here feel real — no fluff, no bots.' },
];

function ReviewCardStack() {
  return (
    <div className="relative h-44 w-full max-w-xs">
      <style>{`
        @keyframes authcard-float {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--rot, 0deg)); }
        }
      `}</style>
      {REVIEWS.map((r, i) => (
        <div
          key={r.name}
          className="absolute w-64 rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md"
          style={{
            top: i * 30,
            left: i * 22,
            '--rot': i % 2 === 0 ? '-2deg' : '1.5deg',
            animation: `authcard-float ${5.5 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            zIndex: 10 - i,
          }}
        >
          <div className="mb-1.5 flex items-center gap-1 text-[11px] text-amber-300">
            {Array.from({ length: r.stars }).map((_, idx) => (
              <i key={idx} className="fas fa-star" />
            ))}
          </div>
          <p className="text-xs leading-relaxed text-slate-300">&ldquo;{r.text}&rdquo;</p>
          <p className="mt-2 flex items-center gap-1 text-[10px] font-medium text-slate-500">
            {r.name}
            <i className="fas fa-circle-check text-teal-400/80" />
            Verified
          </p>
        </div>
      ))}
    </div>
  );
}

export default function AuthShell({ eyebrow, supporting, children }) {
  return (
    <div
      style={{ '--font-display': displayFontStack, '--font-body': bodyFontStack }}
      className="min-h-screen bg-[#0b0e13] font-[family-name:var(--font-body)] text-slate-100"
    >
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col lg:flex-row">
        {/* Brand panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0f2b28] via-[#0b0e13] to-[#15111c] px-6 py-8 sm:px-10 sm:py-10 lg:w-[45%] lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-[110px]" />

          <Link href="/" className="relative z-10 flex w-fit items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-300 to-teal-500 font-[family-name:var(--font-display)] text-lg font-semibold text-[#0b0e13]">
              C
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white">
              CriticPick
            </span>
          </Link>

          <div className="relative z-10 mt-10 lg:mt-0">
            {eyebrow && (
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/80">
                {eyebrow}
              </p>
            )}
            <h1 className="font-[family-name:var(--font-display)] text-[2rem] font-medium leading-[1.12] text-white sm:text-[2.4rem] lg:text-[2.6rem]">
              Welcome to CriticPick
            </h1>
            <p className="mt-3 bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text font-[family-name:var(--font-display)] text-lg italic text-transparent">
              Trusted Reviews. Smarter Choices.
            </p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-400">{supporting}</p>

            <div className="mt-10 hidden sm:block">
              <ReviewCardStack />
            </div>
          </div>

          <p className="relative z-10 mt-10 hidden text-xs text-slate-600 lg:block">
            © {new Date().getFullYear()} CriticPick. All rights reserved.
          </p>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-16">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
