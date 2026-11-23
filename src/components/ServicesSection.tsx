'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import { ArrowRight, Calculator, Check, Link as LinkIcon } from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

export function ServicesSection() {
  const { data, triggerServiceInquiry } = usePortfolio();
  const shouldReduceMotion = useSafeReducedMotion();

  const visibleServices = data.services.filter((s) => s.visible !== false);

  if (visibleServices.length === 0) return null;

  return (
    <section
      id="services"
      className="scroll-mt-20 border-b border-slate-800/70 bg-slate-950 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-cyan-400">
                Freelance Services
              </p>
              <h2 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Practical Containerization & Multi-Service Setup
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                Scoped, deliverable-focused engagements backed by working implementations in my public repositories.
              </p>
            </div>

            <Link
              href="/quote"
              className="inline-flex min-h-[42px] shrink-0 items-center gap-2 self-start rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 whitespace-nowrap transition-colors hover:bg-cyan-400 hover:text-slate-950"
            >
              <Calculator className="h-4 w-4" aria-hidden="true" />
              <span>Estimate Scope & Timeline (/quote)</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {visibleServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8 transition-all duration-200 hover:border-cyan-400/45 hover:shadow-[0_0_32px_-12px_rgba(34,211,238,0.25)]"
              >
                <div>
                  <p className="font-mono text-xs font-medium text-cyan-400 tabular-nums">
                    {service.number}. Service Offering
                  </p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-white">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {service.summary}
                  </p>

                  <div className="mt-6 border-t border-slate-800/80 pt-5">
                    <p className="text-xs font-semibold text-slate-200">
                      Concrete Deliverables
                    </p>
                    <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs leading-relaxed text-slate-300"
                        >
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-5">
                  <a
                    href={service.proofAnchor}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 underline decoration-slate-700 underline-offset-4 transition-colors hover:text-cyan-300 hover:decoration-cyan-400"
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                    <span>{service.proofLabel}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      triggerServiceInquiry(
                        service.prefillStack,
                        service.prefillHelp,
                        service.title
                      )
                    }
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 whitespace-nowrap transition-all duration-150 hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <span>{service.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
