'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

export function Footer() {
  const { data, openTerminal } = usePortfolio();
  const { profile } = data;

  const visibleSocialLinks = (profile.socialLinks ?? []).filter(
    (l) => l.visible !== false
  );

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p>
          {profile.name} · {profile.headline} · {profile.location}
        </p>

        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={openTerminal}
            className="inline-flex items-center gap-1.5 font-mono text-cyan-300 transition-colors hover:text-cyan-200"
          >
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Open Terminal (Cmd+K)</span>
          </button>

          <Link href="/quote" className="transition-colors hover:text-slate-100">
            Scope Estimator
          </Link>
          <Link href="/incidents" className="transition-colors hover:text-slate-100">
            Incident Lab
          </Link>
          <Link href="/resume" className="transition-colors hover:text-slate-100">
            Resume
          </Link>
          <Link href="/admin" className="transition-colors hover:text-slate-100">
            Admin
          </Link>

          {visibleSocialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target={link.url.startsWith('mailto:') ? undefined : '_blank'}
              rel={
                link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'
              }
              className="transition-colors hover:text-slate-100"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
