"use client";

import { useEffect } from "react";

interface NavbarProps {
  hasActiveReport: boolean;
  repoLabel?: string;
  onReset: () => void;
}

export function Navbar({ hasActiveReport, repoLabel, onReset }: NavbarProps) {
  useEffect(() => {
    if (!hasActiveReport) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const activeEl = document.activeElement;
      const tagName = activeEl?.tagName?.toLowerCase();
      const isInputFocused =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);
      if (!isInputFocused) {
        onReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasActiveReport, onReset]);

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-[#E2E8F0] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Shield-Lens Vector Mark, Wordmark & Version */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0 transition-opacity group-hover:opacity-80"
            >
              <path
                d="M12 2.75L4.5 6V11.5C4.5 16.4 7.7 20.9 12 22.25C16.3 20.9 19.5 16.4 19.5 11.5V6L12 2.75Z"
                stroke="#0F172A"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3.25"
                stroke="#0F172A"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="1.4" fill="#4F46E5" />
            </svg>
            <span className="text-sm font-semibold tracking-tight text-[#0F172A]">
              AegisLens
            </span>
          </button>

          <span className="rounded border border-[#E2E8F0] bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-xs text-[#475569]">
            v1.0
          </span>

          {repoLabel ? (
            <span className="hidden items-center gap-2 font-mono text-xs text-[#64748B] sm:inline-flex">
              <span className="text-[#CBD5E1]">/</span>
              <span>{repoLabel}</span>
            </span>
          ) : null}
        </div>

        {/* Right: New Scan Action */}
        <div className="flex items-center gap-3">
          {hasActiveReport ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC]"
            >
              <span>New Scan</span>
              <kbd className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1 py-0.5 font-mono text-[10px] text-[#64748B]">
                ESC
              </kbd>
            </button>
          ) : (
            <span className="hidden font-mono text-xs text-[#64748B] sm:inline-block">
              Static &amp; Semantic Codebase Audit
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
