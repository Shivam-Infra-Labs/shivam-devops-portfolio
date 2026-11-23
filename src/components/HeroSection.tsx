'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  Boxes,
  CheckCircle2,
  Clock,
  Container,
  ExternalLink,
  GitBranch,
  MapPin,
  Mail,
  Network,
  Server,
  Terminal,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';
import type { CiWorkflowStatus } from '@/src/lib/github';
import type { StackIconKey } from '@/src/types/portfolio';
import { FloatingInfraBackground } from './FloatingInfraBackground';
import { ProfileAvatar } from './ProfileAvatar';

function renderStackIcon(iconKey: StackIconKey) {
  switch (iconKey) {
    case 'docker':
      return <Container className="h-4 w-4 text-cyan-400" />;
    case 'kubernetes':
      return <Boxes className="h-4 w-4 text-emerald-400" />;
    case 'github-actions':
      return <GitBranch className="h-4 w-4 text-cyan-400" />;
    case 'linux':
      return <Terminal className="h-4 w-4 text-slate-200" />;
    case 'nginx':
      return <Server className="h-4 w-4 text-emerald-400" />;
    case 'prometheus':
      return <Activity className="h-4 w-4 text-cyan-400" />;
    case 'cisco':
      return <Network className="h-4 w-4 text-emerald-400" />;
  }
}

interface HeroSectionProps {
  ciStatus?: CiWorkflowStatus;
}

export function HeroSection({ ciStatus }: HeroSectionProps) {
  const { data } = usePortfolio();
  const { profile, coreStack } = data;
  const shouldReduceMotion = useSafeReducedMotion();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const visibleStack = coreStack.filter((item) => item.visible !== false);

  const ciHref =
    ciStatus?.htmlUrl ||
    'https://github.com/Shivam-Infra-Labs/mean-stack-example/actions';
  const ciIsPassing =
    ciStatus?.isLiveSynced &&
    ciStatus.status === 'completed' &&
    ciStatus.conclusion === 'success';
  const ciIsRunning =
    ciStatus?.isLiveSynced &&
    (ciStatus.status === 'in_progress' || ciStatus.status === 'queued');
  const ciIsFailing =
    ciStatus?.isLiveSynced &&
    ciStatus.status === 'completed' &&
    (ciStatus.conclusion === 'failure' || ciStatus.conclusion === 'cancelled');

  return (
    <section className="relative overflow-hidden border-b border-slate-800/70 bg-slate-950">
      <FloatingInfraBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          {/* Status Availability Pill (toggled via Admin) */}
          {profile.availabilityActive !== false && (
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>{profile.availabilityBadge}</span>
            </div>
          )}

          {/* Framed Profile Photo with SK Monogram Fallback */}
          <div className="mb-6">
            <ProfileAvatar
              src={profile.photoUrl}
              alt={profile.name}
              monogram={profile.monogram}
              size="lg"
            />
          </div>

          {/* Name & Headline */}
          <p className="mb-2 font-mono text-sm font-medium tracking-wide text-cyan-300">
            {profile.name}
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {profile.headline}
          </h1>

          {/* 1-Sentence Hands-on Summary */}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {profile.subheadline}
          </p>

          {/* Availability & Location Line */}
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
            <span>{profile.availabilityLine}</span>
          </div>

          {/* GitHub Actions Workflow Status Badge */}
          <div className="mt-5 flex justify-center">
            <a
              href={ciHref}
              target="_blank"
              rel="noopener noreferrer"
              title={
                ciStatus?.isLiveSynced
                  ? `Latest GitHub Actions run on ${ciStatus.repoFullName}${
                      ciStatus.formattedUpdatedAt
                        ? ` (${ciStatus.formattedUpdatedAt})`
                        : ''
                    }`
                  : 'Inspect GitHub Actions CI workflow runs'
              }
              className="group inline-flex flex-wrap items-center justify-center overflow-hidden rounded-lg border border-slate-800/90 bg-slate-900/75 font-mono text-[11px] transition-colors hover:border-cyan-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 text-slate-300">
                <GitBranch className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                <span>
                  {ciStatus?.isLiveSynced
                    ? `${ciStatus.workflowName}`
                    : 'CI · ci.yml'}
                </span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 border-l border-slate-800 px-3 py-1.5 font-semibold ${
                  ciIsFailing
                    ? 'bg-rose-500/15 text-rose-300'
                    : ciIsRunning
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                {ciIsFailing ? (
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                ) : ciIsRunning ? (
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {ciIsPassing
                    ? `passing${ciStatus?.shortSha ? ` · #${ciStatus.shortSha}` : ''}`
                    : ciIsRunning
                      ? 'running'
                      : ciIsFailing
                        ? 'failing'
                        : 'lint · build · docker'}
                </span>
                <ExternalLink
                  className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>

          {/* Exactly TWO Primary CTA Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#projects"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 whitespace-nowrap shrink-0 transition-all duration-150 hover:-translate-y-0.5 hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span>View DevOps Projects</span>
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href="#contact"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 whitespace-nowrap shrink-0 transition-all duration-150 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Mail className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <span>Contact Me</span>
            </a>
          </div>

          {/* Subtle Core Stack Icon Strip */}
          {visibleStack.length > 0 && (
            <div className="mt-12 w-full max-w-2xl border-t border-slate-800/80 pt-7">
              <p className="mb-4 text-xs font-medium text-slate-500">
                Core Infrastructure Stack
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {visibleStack.map((item) => {
                  const isOpen = activeTooltipId === item.id;
                  return (
                    <div key={item.id} className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setActiveTooltipId(item.id)}
                        onMouseLeave={() =>
                          setActiveTooltipId((prev) => (prev === item.id ? null : prev))
                        }
                        onFocus={() => setActiveTooltipId(item.id)}
                        onBlur={() =>
                          setActiveTooltipId((prev) => (prev === item.id ? null : prev))
                        }
                        onClick={() =>
                          setActiveTooltipId((prev) =>
                            prev === item.id ? null : item.id
                          )
                        }
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-800/90 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-500/40 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        {renderStackIcon(item.iconKey)}
                        <span className="font-mono">{item.name}</span>
                      </button>

                      {isOpen && (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 w-56 -translate-x-1/2 rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-2 text-left shadow-xl"
                        >
                          <p className="text-xs font-semibold text-cyan-300">
                            {item.name} · {item.category}
                          </p>
                          <p className="mt-0.5 text-xs leading-snug text-slate-300">
                            {item.tooltip}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
