'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  Briefcase,
  ExternalLink,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

interface MatchedItem {
  id: string;
  type: 'Featured Project' | 'Project / Lab' | 'Incident Lab';
  title: string;
  summary: string;
  url: string;
  isInternal: boolean;
  matchedKeywords: string[];
  score: number;
}

const ROLE_PRESETS: { label: string; jd: string }[] = [
  {
    label: 'Junior DevOps Engineer',
    jd: 'Looking for a Junior DevOps Engineer with hands-on Docker, Docker Compose, Kubernetes, GitHub Actions CI/CD pipelines, Linux administration, Prometheus monitoring, and Nginx reverse proxy experience.',
  },
  {
    label: 'Cloud & Container Engineer',
    jd: 'Seeking a Cloud & Container Engineer experienced with Kubernetes deployments, containerization, multi-container Docker Compose stacks, MongoDB/MySQL persistence, healthchecks, and observability with Grafana.',
  },
  {
    label: 'Network & Linux Support',
    jd: 'Hiring a Network & Linux Support engineer skilled in Cisco Packet Tracer, OSPF routing, VLAN segmentation, Layer-3 SVI gateways, Linux troubleshooting, and TCP/IP subnetting.',
  },
];

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'your',
  'you',
  'are',
  'looking',
  'seeking',
  'hiring',
  'engineer',
  'role',
  'experience',
  'hands',
  'skills',
  'work',
  'using',
]);

function extractTokens(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9+.#/\-\s]/g, ' ')
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))
    )
  );
}

export function RoleProjectMatcher() {
  const { data } = usePortfolio();
  const shouldReduceMotion = useSafeReducedMotion();
  const [jdText, setJdText] = useState(ROLE_PRESETS[0].jd);
  const [activePreset, setActivePreset] = useState(ROLE_PRESETS[0].label);

  const matches = useMemo(() => {
    const tokens = extractTokens(jdText);
    const results: MatchedItem[] = [];

    const scoreDocument = (haystackParts: string[]) => {
      const haystack = haystackParts.join(' ').toLowerCase();
      const hitTokens: string[] = [];
      for (const token of tokens) {
        if (haystack.includes(token)) {
          hitTokens.push(token);
        }
      }
      return hitTokens;
    };

    // 1. Featured Project
    if (data.featuredProject.visible !== false) {
      const hits = scoreDocument([
        data.featuredProject.title,
        data.featuredProject.summary,
        ...data.featuredProject.stackTags,
        ...data.featuredProject.contributions,
      ]);
      if (hits.length > 0 || tokens.length === 0) {
        results.push({
          id: data.featuredProject.id,
          type: 'Featured Project',
          title: data.featuredProject.title,
          summary: data.featuredProject.summary,
          url: data.featuredProject.repoUrl,
          isInternal: false,
          matchedKeywords: hits.slice(0, 6),
          score: hits.length + 1,
        });
      }
    }

    // 2. Engineering Work & Labs
    for (const proj of data.engineeringWork) {
      if (proj.visible === false) continue;
      const hits = scoreDocument([
        proj.title,
        proj.category,
        proj.kicker,
        proj.summary,
        ...proj.stackTags,
        ...proj.highlights,
      ]);
      if (hits.length > 0 || tokens.length === 0) {
        results.push({
          id: proj.id,
          type: 'Project / Lab',
          title: proj.title,
          summary: proj.summary,
          url: proj.primaryUrl,
          isInternal: false,
          matchedKeywords: hits.slice(0, 6),
          score: hits.length,
        });
      }
    }

    // 3. Incident Lab Scenarios
    for (const inc of data.incidentScenarios) {
      if (inc.visible === false) continue;
      const hits = scoreDocument([
        inc.title,
        inc.category,
        inc.symptom,
        inc.rootCause,
        inc.interviewSummary,
      ]);
      if (hits.length > 0 || tokens.length === 0) {
        results.push({
          id: inc.id,
          type: 'Incident Lab',
          title: inc.title,
          summary: inc.symptom,
          url: '/incidents',
          isInternal: true,
          matchedKeywords: hits.slice(0, 6),
          score: hits.length,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [jdText, data]);

  return (
    <section
      id="matcher"
      className="scroll-mt-20 border-b border-slate-800/70 bg-slate-950 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                <span>For Recruiters & Hiring Managers</span>
              </div>
              <h2 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Relevant Projects & Labs for This Role
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Select a target role or paste any Job Description to filter matching repositories, labs, and incident scenarios from my portfolio.
              </p>
            </div>
          </div>

          {/* Role Preset Buttons */}
          <div className="mb-4 flex flex-wrap gap-2">
            {ROLE_PRESETS.map((preset) => {
              const active = activePreset === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setActivePreset(preset.label);
                    setJdText(preset.jd);
                  }}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                      : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* JD Paste Input */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="jd-matcher-input"
                  className="text-xs font-semibold text-slate-200"
                >
                  Job Description / Required Skills
                </label>
                {jdText && (
                  <button
                    type="button"
                    onClick={() => {
                      setActivePreset('');
                      setJdText('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <textarea
                id="jd-matcher-input"
                rows={7}
                value={jdText}
                onChange={(e) => {
                  setActivePreset('');
                  setJdText(e.target.value);
                }}
                placeholder="Paste job requirements (e.g. Docker, Kubernetes, OSPF, GitHub Actions, Linux, Prometheus)..."
                className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950/90 p-4 text-xs leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
              />
            </div>

            {/* Matched Projects Output */}
            <div className="lg:col-span-7">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                  <Search className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                  <span>Matched Portfolio Proof</span>
                </span>
                <span className="font-mono tabular-nums">
                  {matches.length} relevant {matches.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {matches.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 text-center text-xs text-slate-400">
                  No direct keyword matches found. Try adding terms like{' '}
                  <code className="font-mono text-cyan-300">docker</code>,{' '}
                  <code className="font-mono text-cyan-300">kubernetes</code>,{' '}
                  <code className="font-mono text-cyan-300">ospf</code>, or{' '}
                  <code className="font-mono text-cyan-300">linux</code>.
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-mono font-semibold text-cyan-300">
                            {item.type}
                          </span>
                          {item.matchedKeywords.length > 0 && (
                            <>
                              <span aria-hidden="true" className="text-slate-600">
                                ·
                              </span>
                              <span className="font-mono text-emerald-300">
                                Matched: {item.matchedKeywords.join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="mt-1 text-sm font-bold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {item.summary}
                        </p>
                      </div>

                      {item.isInternal ? (
                        <Link
                          href={item.url}
                          className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 whitespace-nowrap transition-colors hover:bg-cyan-400 hover:text-slate-950"
                        >
                          <span>Inspect Lab</span>
                        </Link>
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white"
                        >
                          <span>GitHub Repo</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
