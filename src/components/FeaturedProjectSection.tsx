'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FolderGit2,
  X,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';
import {
  extractGitHubRepoName,
  type GitHubRepoProofMap,
} from '@/src/lib/github';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { ArchitectureDecisionsAccordion } from './ArchitectureDecisionsAccordion';

interface FeaturedProjectSectionProps {
  repoProofMap?: GitHubRepoProofMap;
}

export function FeaturedProjectSection({
  repoProofMap = {},
}: FeaturedProjectSectionProps) {
  const { data } = usePortfolio();
  const { featuredProject, incidentScenarios } = data;
  const shouldReduceMotion = useSafeReducedMotion();
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  const [copiedProof, setCopiedProof] = useState(false);

  const repoSlug = extractGitHubRepoName(featuredProject.repoUrl);
  const repoProof = repoSlug ? repoProofMap[repoSlug.toLowerCase()] : undefined;

  const handleCopyProof = async () => {
    try {
      await navigator.clipboard.writeText(featuredProject.repoUrl);
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const flagshipIncident =
    incidentScenarios.find((s) => s.visible !== false) ?? incidentScenarios[0];

  useEffect(() => {
    if (!caseStudyOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCaseStudyOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [caseStudyOpen]);

  if (featuredProject.visible === false) {
    return null;
  }

  return (
    <section
      id="projects"
      className="scroll-mt-20 border-b border-slate-800/70 bg-slate-950 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Section Lead */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-cyan-400">
                {featuredProject.kicker}
              </p>
              <h2 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {featuredProject.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-mono">
                {featuredProject.stackTags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    {idx > 0 && (
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                    )}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
                {repoProof && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span className="text-emerald-300">{repoProof.language}</span>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span>Updated {repoProof.formattedUpdatedAt}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start">
              <a
                href={featuredProject.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3.5 py-2 font-mono text-xs text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
              >
                <FolderGit2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                <span>{featuredProject.repoName}</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={handleCopyProof}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-300 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white"
              >
                {copiedProof ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                )}
                <span>{copiedProof ? 'Copied Link' : 'Copy Proof Link'}</span>
              </button>
            </div>
          </div>

          {/* Primary Featured Card */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8 shadow-xl shadow-slate-950/60">
            <p className="max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {featuredProject.summary}
            </p>

            {/* Interactive SVG Architecture Diagram */}
            <div className="mt-7">
              <ArchitectureDiagram nodes={featuredProject.architectureNodes} />
            </div>

            {/* 3 Specific Contributions */}
            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <h3 className="text-sm font-semibold text-white">
                  Key Engineering Contributions
                </h3>
                <ul className="mt-3 space-y-3">
                  {featuredProject.contributions.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
                <button
                  type="button"
                  onClick={() => setCaseStudyOpen(true)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 whitespace-nowrap transition-all duration-150 hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>Read Case Study</span>
                </button>

                <a
                  href={featuredProject.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <span>GitHub Repo</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* Flagship Incident Response Lab Callout */}
          {flagshipIncident && (
            <div className="mt-6 flex flex-col justify-between gap-5 rounded-2xl border border-amber-500/30 bg-slate-900/70 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3.5">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-mono text-xs font-semibold text-amber-300">
                    Interactive Troubleshooting · {flagshipIncident.category}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-white sm:text-lg">
                    Incident Response Lab: {flagshipIncident.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {flagshipIncident.symptom}
                  </p>
                </div>
              </div>

              <Link
                href="/incidents"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/15 px-5 py-2.5 text-xs font-semibold text-amber-200 whitespace-nowrap transition-colors hover:bg-amber-400 hover:text-slate-950"
              >
                <span>Open Incident Lab</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Interactive Case Study Modal */}
      <AnimatePresence>
        {caseStudyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
            onClick={() => setCaseStudyOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="case-study-modal-title"
              className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900 p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <p className="font-mono text-xs text-cyan-400">
                    Case Study · {featuredProject.repoName}
                  </p>
                  <h3
                    id="case-study-modal-title"
                    className="mt-1 text-xl font-bold text-white sm:text-2xl"
                  >
                    {featuredProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCaseStudyOpen(false)}
                  aria-label="Close case study"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-300">
                <div>
                  <h4 className="font-semibold text-white">Overview</h4>
                  <p className="mt-1.5">{featuredProject.caseStudy.overview}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white">Engineering Problem</h4>
                  <p className="mt-1.5">{featuredProject.caseStudy.problem}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white">Implementation Steps</h4>
                  <ul className="mt-2 space-y-2">
                    {featuredProject.caseStudy.implementation.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="font-mono text-xs text-cyan-400 mt-0.5 tabular-nums">
                          0{i + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white">
                    Key Implementation Files in Repository
                  </h4>
                  <div className="mt-2.5 divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/60">
                    {featuredProject.caseStudy.files.map((file) => (
                      <div
                        key={file.path}
                        className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        {file.repoFileUrl ? (
                          <a
                            href={file.repoFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-300 underline decoration-emerald-500/40 underline-offset-4 hover:text-emerald-200"
                          >
                            <code>{file.path}</code>
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : (
                          <code className="font-mono text-xs text-emerald-300">
                            {file.path}
                          </code>
                        )}
                        <span className="text-xs text-slate-400 sm:text-right">
                          {file.purpose}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white">Verified Outcome</h4>
                  <p className="mt-1.5">{featuredProject.caseStudy.outcome}</p>
                </div>

                <ArchitectureDecisionsAccordion
                  decisions={featuredProject.caseStudy.decisions}
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => setCaseStudyOpen(false)}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Close
                </button>
                <a
                  href={featuredProject.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
                >
                  <span>Inspect Code on GitHub</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
