'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Container,
  FileWarning,
  Network,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import { SubnetCalculator } from './SubnetCalculator';
import { CommandBuilder } from './CommandBuilder';
import { SecurityAudit } from './SecurityAudit';
import { SecurityLinter } from './SecurityLinter';
import { CheatSheetVault } from './CheatSheetVault';

export function ToolsHub() {
  const { data } = usePortfolio();
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-10">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Portfolio</span>
          </Link>

          <p className="text-xs font-semibold tracking-wide text-cyan-400">
            100% Client-Side Utilities
          </p>
          <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            DevOps Productivity Hub
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Fast, browser-local utilities I use daily for subnetting, Linux/Docker/Kubernetes commands, Cisco IOS verification, Dockerfile/YAML security linting, and startup deployment readiness audits.
          </p>
        </div>

        {/* Quick Tool Directory Cards */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="#subnet"
            className="group rounded-2xl border border-slate-800/90 bg-slate-900/55 p-5 transition-all hover:border-cyan-400/50"
          >
            <Network className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-bold text-white group-hover:text-cyan-200">
              Subnet & OSPF Calculator
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              CIDR ranges, wildcard masks, binary math & IOS statements.
            </p>
          </a>

          <a
            href="#commands"
            className="group rounded-2xl border border-slate-800/90 bg-slate-900/55 p-5 transition-all hover:border-cyan-400/50"
          >
            <Terminal className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-bold text-white group-hover:text-cyan-200">
              Command Builder
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Visual chmod, docker run flags & kubectl debug snippets.
            </p>
          </a>

          <a
            href="#audit"
            className="group rounded-2xl border border-slate-800/90 bg-slate-900/55 p-5 transition-all hover:border-cyan-400/50"
          >
            <ShieldCheck className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-bold text-white group-hover:text-cyan-200">
              Security Readiness Audit
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Production checklist with exportable audit report.
            </p>
          </a>

          <a
            href="#linter"
            className="group rounded-2xl border border-slate-800/90 bg-slate-900/55 p-5 transition-all hover:border-cyan-400/50"
          >
            <FileWarning className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-bold text-white group-hover:text-cyan-200">
              Security Linter
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Audit Dockerfiles & K8s YAML for HIGH/MEDIUM risks.
            </p>
          </a>

          <a
            href="#vault"
            className="group rounded-2xl border border-slate-800/90 bg-slate-900/55 p-5 transition-all hover:border-cyan-400/50"
          >
            <BookOpen className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-bold text-white group-hover:text-cyan-200">
              CLI Cheat-Sheet Vault
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Searchable Docker, K8s, Linux & Cisco IOS commands.
            </p>
          </a>

          <Link
            href="/tools/generator"
            className="group flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-slate-900/75 p-5 transition-all hover:border-cyan-400"
          >
            <div>
              <Container className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-bold text-white group-hover:text-cyan-200">
                DevSecOps Generator
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {data.generatorSettings.proPlanLabel} ·{' '}
                {data.generatorSettings.defaultBaseImage}
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300">
              <span>Open Generator</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Link>
        </div>

        {/* Embedded Daily Utilities */}
        <div className="space-y-10">
          <SubnetCalculator />
          <CommandBuilder />
          <SecurityAudit />
          <SecurityLinter />
          <CheatSheetVault />
        </div>
      </motion.div>
    </div>
  );
}
