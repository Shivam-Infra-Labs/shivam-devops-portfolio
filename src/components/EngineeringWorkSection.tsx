'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, ExternalLink, FolderGit2, Globe } from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  extractGitHubRepoName,
  type GitHubRepoProofMap,
} from '@/src/lib/github';
import { ArchitectureDecisionsAccordion } from './ArchitectureDecisionsAccordion';

interface EngineeringWorkSectionProps {
  repoProofMap?: GitHubRepoProofMap;
}

export function EngineeringWorkSection({
  repoProofMap = {},
}: EngineeringWorkSectionProps) {
  const { data } = usePortfolio();
  const shouldReduceMotion = useSafeReducedMotion();
  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);

  const visibleProjects = data.engineeringWork.filter(
    (p) => p.visible !== false
  );

  if (visibleProjects.length === 0) return null;

  const handleCopyProofLink = async (projectId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedProjectId(projectId);
      setTimeout(() => {
        setCopiedProjectId((prev) => (prev === projectId ? null : prev));
      }, 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <section
      id="labs"
      className="scroll-mt-20 border-b border-slate-800/70 bg-slate-950 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-cyan-400">
              Engineering Work & Hands-on Labs
            </p>
            <h2 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Container Migrations, CCNA Routing & Deployed Apps
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              Verifiable implementations backed directly by source repositories, Docker Compose migrations, and Cisco Packet Tracer network topologies.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {visibleProjects.map((project, index) => {
              const primarySlug = extractGitHubRepoName(project.primaryUrl);
              const secondarySlug = project.secondaryUrl
                ? extractGitHubRepoName(project.secondaryUrl)
                : null;
              const primaryProof = primarySlug
                ? repoProofMap[primarySlug.toLowerCase()]
                : undefined;
              const secondaryProof = secondarySlug
                ? repoProofMap[secondarySlug.toLowerCase()]
                : undefined;
              const isCopied = copiedProjectId === project.id;

              return (
                <motion.article
                  key={project.id}
                  id={project.anchorId}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 transition-all duration-200 hover:border-cyan-400/45 hover:shadow-[0_0_32px_-12px_rgba(34,211,238,0.28)] scroll-mt-24"
                >
                  <div>
                    {/* Clean unboxed kicker metadata */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-medium text-cyan-300">
                        {project.category || 'DevOps'}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                      <span>{project.kicker}</span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                      {project.repoName}
                    </p>

                    {/* Real-time GitHub Repo Proof Metadata */}
                    {primaryProof && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-slate-400">
                        <span className="text-emerald-300">
                          {primaryProof.language}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span>Updated {primaryProof.formattedUpdatedAt}</span>
                        {secondaryProof && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                            <span>
                              LAMP Ref ({secondaryProof.formattedUpdatedAt})
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                      {project.summary}
                    </p>

                    <ul className="mt-4 space-y-2 border-t border-slate-800/80 pt-4 text-xs leading-relaxed text-slate-400">
                      {project.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <ArchitectureDecisionsAccordion
                      decisions={project.decisions}
                      title="Architecture Decisions"
                      compact
                    />
                  </div>

                  <div className="mt-6 border-t border-slate-800/80 pt-4">
                    {/* Unboxed stack line with typographic separators */}
                    <p className="mb-4 font-mono text-[11px] leading-relaxed text-slate-400">
                      {project.stackTags.join(' · ')}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={project.primaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-cyan-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{project.primaryLabel}</span>
                        <ExternalLink className="h-3 w-3 opacity-80" aria-hidden="true" />
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          void handleCopyProofLink(project.id, project.primaryUrl)
                        }
                        title="Copy repository proof link for proposals"
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-700/90 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                        )}
                        <span>{isCopied ? 'Copied' : 'Copy Proof Link'}</span>
                      </button>

                      {project.secondaryUrl && project.secondaryLabel && (
                        <a
                          href={project.secondaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-700/90 px-3 py-2 text-xs font-medium text-slate-300 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                        >
                          <span>{project.secondaryLabel}</span>
                          <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
                        </a>
                      )}

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 whitespace-nowrap transition-colors hover:bg-emerald-500/20"
                        >
                          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{project.liveLabel || 'Live Demo'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
