'use client';

import React, { useState } from 'react';
import { ChevronDown, Lightbulb } from 'lucide-react';
import type { ArchitectureDecision } from '@/src/types/portfolio';

interface ArchitectureDecisionsAccordionProps {
  decisions?: ArchitectureDecision[];
  title?: string;
  compact?: boolean;
}

export function ArchitectureDecisionsAccordion({
  decisions,
  title = 'Architecture Decisions · Why I Built It This Way',
  compact = false,
}: ArchitectureDecisionsAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(compact ? null : 0);

  if (!decisions || decisions.length === 0) {
    return null;
  }

  return (
    <div className={compact ? 'mt-4 border-t border-slate-800/80 pt-3.5' : ''}>
      <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
        <Lightbulb className="h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
        <span>{title}</span>
      </div>

      <div className="space-y-2">
        {decisions.map((decision, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={`${decision.title}-${idx}`}
              className="overflow-hidden rounded-lg border border-slate-800/90 bg-slate-950/70"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-900/70 hover:text-white"
              >
                <span className="truncate">{decision.title}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="space-y-1.5 border-t border-slate-800/80 px-3 py-2.5 text-xs leading-relaxed">
                  <p className="text-slate-200">
                    <span className="font-mono text-[11px] font-semibold text-cyan-300">
                      Choice:{' '}
                    </span>
                    {decision.choice}
                  </p>
                  <p className="text-slate-400">
                    <span className="font-mono text-[11px] font-semibold text-emerald-300">
                      Trade-off:{' '}
                    </span>
                    {decision.tradeoff}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
