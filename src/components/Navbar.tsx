'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, Terminal, X } from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

export function Navbar() {
  const { data, openTerminal } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [labsMenuOpen, setLabsMenuOpen] = useState(false);
  const labsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!labsMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        labsMenuRef.current &&
        !labsMenuRef.current.contains(e.target as Node)
      ) {
        setLabsMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLabsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [labsMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0 transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
        >
          {data.profile.name}
        </Link>

        {/* Zone 2: Single-line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          <Link
            href="/#projects"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 hover:underline hover:underline-offset-8 hover:decoration-cyan-400/70"
          >
            Projects
          </Link>

          <div ref={labsMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setLabsMenuOpen((prev) => !prev)}
              aria-expanded={labsMenuOpen}
              aria-haspopup="menu"
              className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
            >
              <span>Labs</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  labsMenuOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {labsMenuOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-3 w-52 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-xl"
              >
                <Link
                  role="menuitem"
                  href="/#labs"
                  onClick={() => setLabsMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Hands-on Labs & Repos
                </Link>
                <Link
                  role="menuitem"
                  href="/incidents"
                  onClick={() => setLabsMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-slate-800 hover:text-cyan-200"
                >
                  Incident Lab (/incidents)
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/#services"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 hover:underline hover:underline-offset-8 hover:decoration-cyan-400/70"
          >
            Services
          </Link>
          <Link
            href="/tools"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 hover:underline hover:underline-offset-8 hover:decoration-cyan-400/70"
          >
            Tools
          </Link>
          <Link
            href="/#about"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 hover:underline hover:underline-offset-8 hover:decoration-cyan-400/70"
          >
            About
          </Link>
          <Link
            href="/resume"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 hover:underline hover:underline-offset-8 hover:decoration-cyan-400/70"
          >
            Resume
          </Link>
        </nav>

        {/* Zone 3: Terminal trigger + Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openTerminal}
            title="Open CLI Terminal (Cmd/Ctrl + K)"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 font-mono text-xs font-medium text-slate-300 whitespace-nowrap shrink-0 transition-colors hover:border-cyan-400/50 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Terminal className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>Open Terminal</span>
          </button>

          <Link
            href="/#contact"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 whitespace-nowrap shrink-0 transition-all duration-150 hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Contact Me
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-slate-200 md:hidden transition-colors hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800/80 bg-slate-950/95 px-4 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <Link
              href="/#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Projects
            </Link>
            <Link
              href="/#labs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Labs
            </Link>
            <Link
              href="/incidents"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 pl-6 text-sm font-medium text-cyan-300 hover:bg-slate-900 hover:text-cyan-200"
            >
              Incident Lab
            </Link>
            <Link
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Services
            </Link>
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Tools
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/resume"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Resume
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openTerminal();
              }}
              className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-left font-mono text-sm font-medium text-cyan-300 hover:bg-slate-900"
            >
              <Terminal className="h-4 w-4" aria-hidden="true" />
              <span>Open Terminal (Cmd+K)</span>
            </button>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Contact Me
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
