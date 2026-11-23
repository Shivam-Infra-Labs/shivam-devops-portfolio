'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

export function ResumeView() {
  const { data } = usePortfolio();
  const { profile, educationList, certifications, resume } = data;

  const visibleEducation = educationList.filter((e) => e.visible !== false);
  const visibleCerts = certifications.filter((c) => c.visible !== false);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 print:bg-white print:p-0">
      {/* Screen-only Action Bar */}
      <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          <span>Back to Portfolio</span>
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>Download / Print PDF</span>
        </button>
      </div>

      {/* Printable ATS-Friendly Resume Sheet */}
      <article className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl sm:p-12 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Header */}
        <header className="border-b border-slate-300 pb-5">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {profile.name}
          </h1>
          <p className="mt-1 text-base font-semibold text-slate-700">
            {profile.headline}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600">
            <span>{profile.availabilityLine}</span>
            <span aria-hidden="true">·</span>
            <a
              href={`mailto:${profile.email}`}
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-950"
            >
              {profile.email}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-950"
            >
              github.com/Shivam-Infra-Labs
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-950"
            >
              LinkedIn
            </a>
          </div>
        </header>

        {/* Summary */}
        <section className="mt-6">
          <h2 className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-800">
            Professional Summary
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-700">
            {resume.summary}
          </p>
        </section>

        {/* Technical Skills */}
        <section className="mt-6">
          <h2 className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-800">
            Technical Skills
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            {resume.skillGroups.map((group) => (
              <div key={group.group} className="flex flex-col sm:flex-row sm:gap-2">
                <span className="min-w-[210px] font-semibold text-slate-900">
                  {group.group}:
                </span>
                <span className="text-slate-700">{group.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Infrastructure Projects & Hands-On Labs */}
        <section className="mt-6">
          <h2 className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-800">
            Engineering Projects & Infrastructure Labs
          </h2>
          <div className="mt-3 space-y-4">
            {resume.projects.map((project) => (
              <div key={project.title}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-950">
                    {project.title}
                  </h3>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-slate-600 underline decoration-slate-300 underline-offset-2 print:no-underline"
                  >
                    {project.repoUrl.replace('https://', '')}
                  </a>
                </div>
                <p className="mt-0.5 font-mono text-xs text-slate-600">
                  {project.subtitle}
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
                  {project.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        {visibleEducation.length > 0 && (
          <section className="mt-6">
            <h2 className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-800">
              Education
            </h2>
            <div className="mt-2.5 space-y-3">
              {visibleEducation.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-950">
                      {edu.degree}
                    </h3>
                    <span className="font-mono text-xs text-slate-600">
                      {edu.institution} · {edu.years}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {edu.details}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Verified Tracks */}
        {visibleCerts.length > 0 && (
          <section className="mt-6">
            <h2 className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-800">
              Certifications & Verified Tracks
            </h2>
            <ul className="mt-2.5 space-y-2 text-sm text-slate-700">
              {visibleCerts.map((cert) => (
                <li
                  key={cert.id}
                  className="flex flex-col sm:flex-row sm:justify-between"
                >
                  <span>
                    <strong className="font-semibold text-slate-900">
                      {cert.title}
                    </strong>{' '}
                    — {cert.issuer}
                    {cert.year ? ` (${cert.year})` : ''}
                  </span>
                  <a
                    href={cert.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-slate-600 underline decoration-slate-300 underline-offset-2 print:no-underline"
                  >
                    {cert.proofLabel}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
