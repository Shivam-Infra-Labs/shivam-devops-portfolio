'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  Award,
  ExternalLink,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';
import { ProfileAvatar } from './ProfileAvatar';

export function AboutCredentialsSection() {
  const { data } = usePortfolio();
  const { profile, about, educationList, certifications } = data;
  const shouldReduceMotion = useSafeReducedMotion();

  const visibleEducation = educationList.filter((e) => e.visible !== false);
  const visibleCerts = certifications.filter((c) => c.visible !== false);
  const visibleSocialLinks = (profile.socialLinks ?? []).filter(
    (l) => l.visible !== false
  );

  return (
    <section
      id="about"
      className="scroll-mt-20 border-b border-slate-800/70 bg-slate-950 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-cyan-400">
              Background & Verification
            </p>
            <h2 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
              About, Education & Verified Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: About & Education Card */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8 lg:col-span-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <ProfileAvatar
                  src={profile.photoUrl}
                  alt={profile.name}
                  monogram={profile.monogram}
                  size="md"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                  <p className="mt-1 text-sm text-cyan-300">
                    {profile.headline} · {profile.location}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-300">
                <p>{about.intro}</p>
                <p className="text-slate-400">{about.journey}</p>
              </div>

              {/* Education Entries */}
              {visibleEducation.length > 0 && (
                <div className="mt-7 space-y-5 border-t border-slate-800/80 pt-6">
                  {visibleEducation.map((edu) => (
                    <div key={edu.id} className="flex items-start gap-3">
                      <GraduationCap
                        className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-xs font-semibold text-cyan-400">
                          Education · {edu.institution} ({edu.years})
                        </p>
                        <h4 className="mt-1 text-base font-bold text-white">
                          {edu.degree}
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                          {edu.details}
                        </p>
                        <p className="mt-2 font-mono text-xs text-slate-400">
                          {edu.focusAreas.join(' · ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Profile Links & Printable Resume */}
              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-800/80 pt-6">
                <Link
                  href="/resume"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-cyan-300"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>View Printable Resume</span>
                </Link>

                {visibleSocialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={
                      link.url.startsWith('mailto:')
                        ? undefined
                        : 'noopener noreferrer'
                    }
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white"
                  >
                    <span>{link.label}</span>
                    {!link.url.startsWith('mailto:') && (
                      <ExternalLink
                        className="h-3 w-3 text-slate-400"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Certifications & Verified Credentials Grid */}
            <div className="flex flex-col gap-5 lg:col-span-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  Certifications & Verified Tracks
                </h3>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  {visibleCerts.length} entries
                </span>
              </div>

              {visibleCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 transition-colors hover:border-cyan-400/40"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <Award
                        className="h-4 w-4 text-emerald-400"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-emerald-300">
                        {cert.category}
                      </span>
                      {cert.year && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">
                            ·
                          </span>
                          <span className="font-mono tabular-nums">
                            {cert.year}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                      <span className="truncate">{cert.issuer}</span>
                    </div>

                    <h4 className="mt-2.5 text-base font-bold text-white">
                      {cert.title}
                    </h4>

                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {cert.summary}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-800/80 pt-4">
                    <a
                      href={cert.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                    >
                      <span>{cert.proofLabel}</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
