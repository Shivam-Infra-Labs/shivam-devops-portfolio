'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Download, ShieldCheck } from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

interface AuditItem {
  id: string;
  label: string;
  category: string;
  recommendation: string;
}

const AUDIT_ITEMS: AuditItem[] = [
  {
    id: 'non-root',
    label: 'Non-root Docker container user (USER node / appuser)',
    category: 'Container Hardening',
    recommendation: 'Add a dedicated non-root USER instruction in the runtime Dockerfile stage.',
  },
  {
    id: 'https-ssl',
    label: 'HTTPS / TLS enabled with automated certificate renewal',
    category: 'Transport Security',
    recommendation: 'Terminate TLS at Nginx/Caddy or cloud ingress with Certbot/ACME auto-renewal.',
  },
  {
    id: 'env-excluded',
    label: '.env secrets excluded via .gitignore and .dockerignore',
    category: 'Secrets Hygiene',
    recommendation: 'Add .env* to .gitignore and .dockerignore and inject runtime secrets via environment.',
  },
  {
    id: 'db-backups',
    label: 'Automated database backups with tested restore procedure',
    category: 'Data Reliability',
    recommendation: 'Schedule automated pg_dump/mongodump snapshots to off-host storage and test restores.',
  },
  {
    id: 'healthchecks',
    label: 'Container HEALTHCHECK or Kubernetes readiness/liveness probes',
    category: 'Availability',
    recommendation: 'Expose a /health endpoint and configure Compose healthcheck or K8s probes.',
  },
  {
    id: 'resource-limits',
    label: 'Memory/CPU limits and restart policies configured',
    category: 'Stability',
    recommendation: 'Set deploy.resources.limits or K8s limits plus restart: unless-stopped.',
  },
  {
    id: 'network-isolation',
    label: 'Database isolated on private internal network (not host-exposed)',
    category: 'Network Segmentation',
    recommendation: 'Remove public host port bindings on DB services and route via internal bridge networks.',
  },
  {
    id: 'ci-smoke',
    label: 'Automated CI build & HTTP smoke tests before deployment',
    category: 'CI/CD Verification',
    recommendation: 'Run container build and HTTP status smoke checks on push via GitHub Actions.',
  },
];

export function SecurityAudit() {
  const { triggerServiceInquiry } = usePortfolio();
  const [checkedIds, setCheckedIds] = useState<string[]>([
    'env-excluded',
    'healthchecks',
  ]);
  const [copiedReport, setCopiedReport] = useState(false);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const passedCount = checkedIds.length;
  const totalCount = AUDIT_ITEMS.length;
  const score = Math.round((passedCount / totalCount) * 100);
  const failedItems = AUDIT_ITEMS.filter((item) => !checkedIds.includes(item.id));

  const readinessLabel =
    score >= 88
      ? 'Production Ready'
      : score >= 50
      ? 'Hardening Recommended'
      : 'Critical Gaps Found';

  const buildReportText = () => {
    const lines = [
      `Production Security & Deployment Readiness Report`,
      `Score: ${score}% (${passedCount}/${totalCount} checks passed) — ${readinessLabel}`,
      ``,
      `Passed Checks:`,
      ...AUDIT_ITEMS.filter((i) => checkedIds.includes(i.id)).map(
        (i) => `  [PASS] ${i.label}`
      ),
      ``,
      `Action Items (Failed Checks):`,
      ...(failedItems.length > 0
        ? failedItems.map(
            (i) => `  [FAIL] ${i.label}\n         Fix: ${i.recommendation}`
          )
        : ['  None — all checks passed.']),
    ];
    return lines.join('\n');
  };

  const handleExportReport = () => {
    const blob = new Blob([buildReportText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devops-readiness-audit.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReportText());
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleHireToFix = () => {
    const gapsSummary =
      failedItems.length > 0
        ? failedItems.map((i) => `- ${i.label}`).join('\n')
        : 'Full production infrastructure hardening review';

    triggerServiceInquiry(
      'Docker / Multi-Container / Cloud Deployment',
      `Readiness Audit Score: ${score}%. Need help fixing these failed checks:\n${gapsSummary}`,
      'Production Readiness Audit Remediation'
    );
  };

  return (
    <section
      id="audit"
      className="scroll-mt-24 rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Tool 03 · Startup & Client Checklist</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Production Security & Deployment Readiness Audit
          </h2>
        </div>

        {/* Live Readiness Score */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-left sm:text-right">
          <p className="text-[11px] font-medium text-slate-400">
            Readiness Score
          </p>
          <p className="mt-0.5 font-mono text-2xl font-bold text-cyan-300 tabular-nums">
            {score}%{' '}
            <span className="text-xs font-normal text-slate-400">
              ({passedCount}/{totalCount}) · {readinessLabel}
            </span>
          </p>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {AUDIT_ITEMS.map((item) => {
          const checked = checkedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              aria-pressed={checked}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                checked
                  ? 'border-emerald-500/35 bg-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/75 hover:border-slate-700'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  checked
                    ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                    : 'border-slate-600 bg-slate-900'
                }`}
              >
                {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>
              <span className="block">
                <span className="block text-[11px] font-mono text-cyan-300">
                  {item.category}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-white">
                  {item.label}
                </span>
                {!checked && (
                  <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                    {item.recommendation}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span>Export Audit Report</span>
          </button>

          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
          >
            <span>{copiedReport ? 'Copied Report' : 'Copy Summary'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleHireToFix}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-cyan-300"
        >
          <span>
            Hire Shivam to Fix Failed Checks ({failedItems.length})
          </span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
