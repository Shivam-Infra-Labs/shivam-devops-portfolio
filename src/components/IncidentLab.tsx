'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Terminal,
  Wrench,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';
import type { IncidentScenario } from '@/src/types/portfolio';

function ScenarioWorkspace({ scenario }: { scenario: IncidentScenario }) {
  const [selectedTriageId, setSelectedTriageId] = useState<string | null>(
    scenario.triageOptions[0]?.id ?? null
  );
  const [inspectedIds, setInspectedIds] = useState<string[]>(
    scenario.triageOptions[0]?.id ? [scenario.triageOptions[0].id] : []
  );
  const [showFixStep, setShowFixStep] = useState(false);
  const [verified, setVerified] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const selectedOption =
    scenario.triageOptions.find((opt) => opt.id === selectedTriageId) ??
    scenario.triageOptions[0];

  const handleSelectTriage = (id: string) => {
    setSelectedTriageId(id);
    setInspectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleReset = () => {
    const firstId = scenario.triageOptions[0]?.id ?? null;
    setSelectedTriageId(firstId);
    setInspectedIds(firstId ? [firstId] : []);
    setShowFixStep(false);
    setVerified(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8 shadow-xl">
      {/* Header & Symptom */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-mono font-semibold text-cyan-400">
              {scenario.category}
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="text-amber-300 font-medium">{scenario.severity}</span>
          </div>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {scenario.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset Lab</span>
        </button>
      </div>

      {/* Symptom Statement */}
      <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-semibold text-amber-200">
              Reported Symptom
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-200">
              {scenario.symptom}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Triage Decision */}
      <div className="mt-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white">
            Step 1 — Choose What to Inspect First
          </h3>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {inspectedIds.length}/{scenario.triageOptions.length} inspected
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2.5">
          {scenario.triageOptions.map((opt) => {
            const active = selectedOption?.id === opt.id;
            const visited = inspectedIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectTriage(opt.id)}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                    : visited
                    ? 'border-emerald-500/30 bg-slate-900 text-slate-200 hover:border-cyan-400/40'
                    : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                <Terminal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/70 px-4 py-2 font-mono text-xs text-cyan-300">
              <span>$ {selectedOption.command}</span>
              {selectedOption.isPrimaryClue && (
                <span className="text-[11px] font-semibold text-emerald-400">
                  Primary Root-Cause Clue
                </span>
              )}
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
              {selectedOption.output}
            </pre>
            <div className="border-t border-slate-800/80 bg-slate-900/40 px-4 py-3 text-xs leading-relaxed text-slate-300">
              <strong className="font-semibold text-white">Observation: </strong>
              {selectedOption.insight}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Reveal Root Cause & Dual Fix */}
      <div className="mt-7 border-t border-slate-800/80 pt-6">
        {!showFixStep ? (
          <button
            type="button"
            onClick={() => setShowFixStep(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
          >
            <Wrench className="h-4 w-4" aria-hidden="true" />
            <span>Step 2 — Diagnose Root Cause & Apply Fix</span>
          </button>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">
                Step 2 — Root Cause Analysis
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {scenario.rootCause}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {scenario.fixes.map((fix) => (
                <div
                  key={fix.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/90 p-4"
                >
                  <p className="text-xs font-semibold text-emerald-300">
                    {fix.label}
                  </p>
                  <pre className="mt-2.5 overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-900 p-3 font-mono text-xs leading-relaxed text-cyan-200">
                    {fix.command}
                  </pre>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
                    {fix.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Verification Step */}
            <div className="pt-1">
              {!verified ? (
                <button
                  type="button"
                  onClick={() => setVerified(true)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Run Verification Check</span>
                </button>
              ) : (
                <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-950">
                  <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 font-mono text-xs text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Verified: $ {scenario.verificationCommand}</span>
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-emerald-200">
                    {scenario.verificationOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Interview Explanation Summary */}
      <div className="mt-6 border-t border-slate-800/80 pt-5">
        <button
          type="button"
          onClick={() => setSummaryOpen((prev) => !prev)}
          aria-expanded={summaryOpen}
          className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-left text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white"
        >
          <span>Interview Explanation Summary</span>
          {summaryOpen ? (
            <ChevronUp className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
          )}
        </button>

        {summaryOpen && (
          <div className="mt-2 rounded-xl border border-slate-800/80 bg-slate-950/80 p-4 text-sm leading-relaxed text-slate-300">
            {scenario.interviewSummary}
          </div>
        )}
      </div>
    </div>
  );
}

export function IncidentLab() {
  const { data } = usePortfolio();
  const shouldReduceMotion = useSafeReducedMotion();
  const visibleScenarios = data.incidentScenarios.filter(
    (s) => s.visible !== false
  );
  const [activeId, setActiveId] = useState<string>(
    visibleScenarios[0]?.id ?? ''
  );

  const currentScenario =
    visibleScenarios.find((s) => s.id === activeId) ?? visibleScenarios[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Portfolio</span>
            </Link>
            <p className="text-xs font-semibold tracking-wide text-cyan-400">
              Interactive Troubleshooting Lab
            </p>
            <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Incident Response Lab
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Walk through real-world Kubernetes, Cisco OSPF, and Docker Compose failures—inspecting outputs before revealing the root cause and fix.
            </p>
          </div>
        </div>

        {/* Scenario Switcher Tabs */}
        {visibleScenarios.length > 0 ? (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {visibleScenarios.map((scenario, idx) => {
                const active = currentScenario?.id === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setActiveId(scenario.id)}
                    className={`rounded-xl border px-4 py-2.5 text-left text-xs font-medium transition-colors ${
                      active
                        ? 'border-cyan-400 bg-cyan-400/15 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="font-mono text-[11px] text-cyan-400 mr-2 tabular-nums">
                      0{idx + 1}
                    </span>
                    <span>{scenario.title}</span>
                  </button>
                );
              })}
            </div>

            {currentScenario && (
              <ScenarioWorkspace
                key={currentScenario.id}
                scenario={currentScenario}
              />
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-400">
            No visible incident scenarios configured. Add or enable scenarios in{' '}
            <Link href="/admin" className="text-cyan-300 underline">
              /admin
            </Link>
            .
          </div>
        )}
      </motion.div>
    </div>
  );
}
