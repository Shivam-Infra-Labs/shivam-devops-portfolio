'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Copy,
  FileText,
  Printer,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import { usePortfolio } from '@/src/context/PortfolioContext';

type StackId = 'node' | 'nextjs' | 'lamp' | 'python' | 'mean';
type DbId = 'mongodb' | 'postgresql' | 'mysql' | 'redis' | 'none';
type HostId = 'vps' | 'digitalocean' | 'aws' | 'selfhosted';

interface AddonOption {
  id: string;
  label: string;
  description: string;
  days: number;
  deliverables: string[];
  required?: boolean;
}

const STACK_OPTIONS: Array<{
  id: StackId;
  label: string;
  runtime: string;
  baseDays: number;
}> = [
  {
    id: 'node',
    label: 'Node.js / Express API',
    runtime: 'Node 20 Alpine multi-stage image',
    baseDays: 1,
  },
  {
    id: 'nextjs',
    label: 'Next.js Full-Stack',
    runtime: 'Next.js standalone SSR container',
    baseDays: 1,
  },
  {
    id: 'mean',
    label: 'MEAN / MERN Multi-Tier',
    runtime: 'Frontend + API + Stateful DB topology',
    baseDays: 2,
  },
  {
    id: 'lamp',
    label: 'PHP / LAMP Application',
    runtime: 'Isolated Apache/PHP-FPM + Compose migration',
    baseDays: 2,
  },
  {
    id: 'python',
    label: 'Python / FastAPI / Django',
    runtime: 'Slim Python Gunicorn/Uvicorn container',
    baseDays: 1,
  },
];

const DATABASE_OPTIONS: Array<{
  id: DbId;
  label: string;
  note: string;
  days: number;
}> = [
  {
    id: 'mongodb',
    label: 'MongoDB',
    note: 'Named persistent volume + internal bridge network',
    days: 1,
  },
  {
    id: 'postgresql',
    label: 'PostgreSQL',
    note: 'Persistent PGDATA volume + healthcheck readiness',
    days: 1,
  },
  {
    id: 'mysql',
    label: 'MySQL',
    note: 'Isolated DB service + init schema volume mount',
    days: 1,
  },
  {
    id: 'redis',
    label: 'Redis + Primary DB',
    note: 'In-memory cache tier alongside primary database',
    days: 1,
  },
  {
    id: 'none',
    label: 'None (Stateless)',
    note: 'Stateless application container only',
    days: 0,
  },
];

const HOST_OPTIONS: Array<{ id: HostId; label: string; detail: string }> = [
  {
    id: 'vps',
    label: 'Ubuntu / Debian VPS',
    detail: 'Docker Engine + UFW firewall + Systemd',
  },
  {
    id: 'digitalocean',
    label: 'DigitalOcean Droplet',
    detail: 'Managed SSH + Docker Compose deployment',
  },
  {
    id: 'aws',
    label: 'AWS EC2 / Lightsail',
    detail: 'Security groups + EBS persistent storage',
  },
  {
    id: 'selfhosted',
    label: 'Local / On-Prem Server',
    detail: 'Kind cluster / self-hosted LAN topology',
  },
];

const ADDON_OPTIONS: AddonOption[] = [
  {
    id: 'containers',
    label: 'Docker & Compose Core',
    description: 'Production multi-stage Dockerfile, compose.yaml & .env.example',
    days: 1,
    required: true,
    deliverables: [
      'Multi-stage Dockerfile with non-root runtime user',
      'Declarative compose.yaml with isolated bridge networks & healthchecks',
      '.dockerignore & documented .env.example secret template',
    ],
  },
  {
    id: 'cicd',
    label: 'GitHub Actions CI/CD',
    description: 'Automated lint, build & HTTP endpoint smoke tests on push',
    days: 1,
    deliverables: [
      '.github/workflows/ci.yml with build validation and curl smoke tests',
      'Automated container image build check on main & pull requests',
    ],
  },
  {
    id: 'nginx',
    label: "Nginx Reverse Proxy & Let's Encrypt SSL",
    description: 'TLS termination, HTTP-to-HTTPS redirect & security headers',
    days: 1,
    deliverables: [
      'Nginx upstream reverse proxy config with HSTS & security headers',
      "Automated Let's Encrypt TLS certificate renewal workflow",
    ],
  },
  {
    id: 'monitoring',
    label: 'Prometheus & Grafana Monitoring',
    description: 'Container CPU/RAM metrics scraping and starter dashboards',
    days: 1,
    deliverables: [
      'Prometheus scrape config for host, container, and app metrics',
      'Grafana service definition and starter observability dashboard JSON',
    ],
  },
  {
    id: 'k8s',
    label: 'Kubernetes (Kind / K8s Manifests)',
    description: 'Deployments, ClusterIP Services, ConfigMaps & readiness probes',
    days: 2,
    deliverables: [
      'Kubernetes Deployment, Service, ConfigMap & PVC manifests',
      'Local Kind cluster bootstrap script and rollout smoke test guide',
    ],
  },
  {
    id: 'security',
    label: 'Security Hardening & Runbook',
    description: 'UFW firewall setup, least-privilege audit & handoff docs',
    days: 1,
    deliverables: [
      'Least-privilege port exposure & UFW firewall rules checklist',
      'Step-by-step operator deployment & rollback runbook (README)',
    ],
  },
];

export function QuoteEstimator() {
  const { data, triggerServiceInquiry } = usePortfolio();
  const shouldReduceMotion = useSafeReducedMotion();

  const [projectName, setProjectName] = useState('');
  const [selectedStack, setSelectedStack] = useState<StackId>('nextjs');
  const [selectedDb, setSelectedDb] = useState<DbId>('mongodb');
  const [selectedHost, setSelectedHost] = useState<HostId>('vps');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    'containers',
    'cicd',
    'nginx',
  ]);
  const [notes, setNotes] = useState('');
  const [copiedScope, setCopiedScope] = useState(false);

  const toggleAddon = (id: string, required?: boolean) => {
    if (required) return;
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const scopeCalculation = useMemo(() => {
    const stackObj =
      STACK_OPTIONS.find((s) => s.id === selectedStack) ?? STACK_OPTIONS[0];
    const dbObj =
      DATABASE_OPTIONS.find((d) => d.id === selectedDb) ?? DATABASE_OPTIONS[0];
    const hostObj =
      HOST_OPTIONS.find((h) => h.id === selectedHost) ?? HOST_OPTIONS[0];
    const activeAddons = ADDON_OPTIONS.filter(
      (a) => a.required || selectedAddons.includes(a.id)
    );

    const totalDays =
      stackObj.baseDays +
      dbObj.days +
      activeAddons.reduce((sum, item) => sum + item.days, 0);

    const minDays = Math.max(2, totalDays - 1);
    const maxDays = Math.max(minDays + 1, totalDays + 1);

    const deliverables: string[] = [];
    for (const addon of activeAddons) {
      deliverables.push(...addon.deliverables);
    }
    if (dbObj.id !== 'none') {
      deliverables.push(
        `${dbObj.label} persistent volume & backup/restore command guide`
      );
    }
    deliverables.push(
      `${hostObj.label} target verification (${hostObj.detail})`
    );

    const architectureSummary = [
      projectName.trim() ? `Project: ${projectName.trim()}` : null,
      `Application Stack: ${stackObj.label} (${stackObj.runtime})`,
      `Database / State: ${dbObj.label}`,
      `Target Environment: ${hostObj.label}`,
      `Selected Scope Modules: ${activeAddons.map((a) => a.label).join(', ')}`,
      `Estimated Delivery Window: ${minDays}–${maxDays} Business Days`,
      notes.trim() ? `Additional Notes: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return {
      stackObj,
      dbObj,
      hostObj,
      activeAddons,
      minDays,
      maxDays,
      deliverables,
      architectureSummary,
    };
  }, [projectName, selectedStack, selectedDb, selectedHost, selectedAddons, notes]);

  const handleSendScope = () => {
    const stackLine = `${scopeCalculation.stackObj.label} + ${scopeCalculation.dbObj.label} (${scopeCalculation.hostObj.label})`;
    const helpMessage = `Estimated Scope Brief (${scopeCalculation.minDays}-${scopeCalculation.maxDays} business days):\n\n${scopeCalculation.architectureSummary}\n\nRequested Deliverables:\n- ${scopeCalculation.deliverables.join('\n- ')}`;
    triggerServiceInquiry(
      stackLine,
      helpMessage,
      'DevOps Scope & Quote Estimator'
    );
  };

  const handleCopyScope = async () => {
    const fullText = `${scopeCalculation.architectureSummary}\n\nDeliverables:\n- ${scopeCalculation.deliverables.join('\n- ')}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedScope(true);
      setTimeout(() => setCopiedScope(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 print:max-w-none print:p-0">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Screen-only Header */}
        <div className="mb-10 print:hidden">
          <Link
            href="/#services"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Services</span>
          </Link>

          <p className="text-xs font-semibold tracking-wide text-cyan-400">
            Client Architecture Planner
          </p>
          <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            DevOps Quote & Scope Estimator
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Configure your application stack, CI/CD, TLS proxy, and monitoring requirements to generate an actionable deliverables checklist and printable client scope brief.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 print:block">
          {/* Left Column: Interactive Configurator (Hidden when printing PDF) */}
          <div className="space-y-6 lg:col-span-6 print:hidden">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6">
              <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>01. Stack & Environment Configuration</span>
              </div>

              <div className="space-y-5">
                {/* Project / Client Name */}
                <div>
                  <label
                    htmlFor="scope-project-name"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Project or Company Name (optional for PDF header)
                  </label>
                  <input
                    id="scope-project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Acme SaaS Backend"
                    className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                  />
                </div>

                {/* Application Stack */}
                <div>
                  <span className="block text-xs font-semibold text-slate-200">
                    Application Stack
                  </span>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {STACK_OPTIONS.map((option) => {
                      const active = selectedStack === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedStack(option.id)}
                          className={`rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                            active
                              ? 'border-cyan-400 bg-cyan-400/15 text-white'
                              : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <span className="block text-xs font-semibold">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-400">
                            {option.runtime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Database Tier */}
                <div>
                  <span className="block text-xs font-semibold text-slate-200">
                    Database / Persistence
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DATABASE_OPTIONS.map((db) => {
                      const active = selectedDb === db.id;
                      return (
                        <button
                          key={db.id}
                          type="button"
                          onClick={() => setSelectedDb(db.id)}
                          className={`min-h-[38px] rounded-lg border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                            active
                              ? 'border-cyan-400 bg-cyan-400 text-slate-950 font-semibold'
                              : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          {db.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hosting Target */}
                <div>
                  <span className="block text-xs font-semibold text-slate-200">
                    Target Infrastructure
                  </span>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {HOST_OPTIONS.map((host) => {
                      const active = selectedHost === host.id;
                      return (
                        <button
                          key={host.id}
                          type="button"
                          onClick={() => setSelectedHost(host.id)}
                          className={`rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                            active
                              ? 'border-emerald-400/70 bg-emerald-500/10 text-white'
                              : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <span className="block text-xs font-semibold">
                            {host.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-400">
                            {host.detail}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Infrastructure Add-on Modules */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6">
              <p className="mb-4 text-xs font-semibold text-cyan-400">
                02. Infrastructure & Automation Modules
              </p>

              <div className="space-y-2.5">
                {ADDON_OPTIONS.map((addon) => {
                  const checked =
                    addon.required || selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      disabled={addon.required}
                      onClick={() => toggleAddon(addon.id, addon.required)}
                      className={`flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                        checked
                          ? 'border-cyan-400/60 bg-cyan-500/10 text-white'
                          : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                      } ${addon.required ? 'cursor-default opacity-90' : ''}`}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            checked
                              ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {checked && (
                            <Check className="h-3 w-3" aria-hidden="true" />
                          )}
                        </span>
                        <span>
                          <span className="block text-xs font-semibold text-white">
                            {addon.label}
                            {addon.required ? ' (Included Baseline)' : ''}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-400">
                            {addon.description}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-cyan-300 tabular-nums">
                        +{addon.days}d
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <label
                  htmlFor="scope-custom-notes"
                  className="block text-xs font-semibold text-slate-200"
                >
                  Additional Environment Notes (optional)
                </label>
                <textarea
                  id="scope-custom-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Custom domain setup, zero-downtime blue/green script, existing repo URL..."
                  className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Client Scope Summary & Printable Brief */}
          <div className="lg:col-span-6 print:w-full">
            <article className="rounded-2xl border border-slate-800/90 bg-slate-900/65 p-6 sm:p-8 print:rounded-none print:border-0 print:bg-white print:p-0 print:text-slate-900">
              {/* Printable Brief Header */}
              <header className="border-b border-slate-800 pb-5 print:border-slate-300">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 print:text-slate-600">
                      <FileText className="h-4 w-4 print:hidden" aria-hidden="true" />
                      <span>DevOps Architecture & Scope Brief</span>
                    </div>
                    <h2 className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl print:text-slate-950">
                      {projectName.trim()
                        ? `${projectName.trim()} — Infrastructure Scope`
                        : 'Custom Infrastructure Scope Summary'}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400 print:text-slate-600">
                      Prepared by {data.profile.name} · {data.profile.email} ·{' '}
                      github.com/Shivam-Infra-Labs
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-right print:border-slate-300 print:bg-slate-50">
                    <p className="text-[11px] font-medium text-cyan-200 print:text-slate-600">
                      Estimated Delivery
                    </p>
                    <p className="font-mono text-lg font-bold text-cyan-300 tabular-nums print:text-slate-950">
                      {scopeCalculation.minDays}–{scopeCalculation.maxDays} Days
                    </p>
                  </div>
                </div>
              </header>

              {/* Architecture Matrix */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 print:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 print:border-slate-300 print:bg-white">
                  <p className="text-[11px] font-medium text-slate-400 print:text-slate-500">
                    Application Stack
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white print:text-slate-950">
                    {scopeCalculation.stackObj.label}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 print:border-slate-300 print:bg-white">
                  <p className="text-[11px] font-medium text-slate-400 print:text-slate-500">
                    Database Tier
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white print:text-slate-950">
                    {scopeCalculation.dbObj.label}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 print:border-slate-300 print:bg-white">
                  <p className="text-[11px] font-medium text-slate-400 print:text-slate-500">
                    Target Host
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white print:text-slate-950">
                    {scopeCalculation.hostObj.label}
                  </p>
                </div>
              </div>

              {/* Included Modules */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 print:text-slate-800">
                  Selected Modules ({scopeCalculation.activeAddons.length})
                </h3>
                <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {scopeCalculation.activeAddons.map((addon) => (
                    <li
                      key={addon.id}
                      className="flex items-center gap-2 text-xs text-slate-200 print:text-slate-800"
                    >
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-emerald-400 print:text-slate-900"
                        aria-hidden="true"
                      />
                      <span>{addon.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deliverables Checklist */}
              <div className="mt-6 border-t border-slate-800/80 pt-5 print:border-slate-300">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 print:text-slate-800">
                  Concrete Engineering Deliverables Checklist
                </h3>
                <ul className="mt-3 space-y-2">
                  {scopeCalculation.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-300 print:text-slate-800"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400 print:text-slate-900"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {notes.trim() && (
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/75 p-4 print:border-slate-300 print:bg-slate-50">
                  <p className="text-[11px] font-semibold text-slate-300 print:text-slate-700">
                    Client Notes
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300 print:text-slate-800">
                    {notes.trim()}
                  </p>
                </div>
              )}

              {/* Verifiable Reference Repos (Great for exported PDF credibility) */}
              <div className="mt-6 border-t border-slate-800/80 pt-4 text-[11px] text-slate-400 print:border-slate-300 print:text-slate-600">
                <p className="font-semibold text-slate-300 print:text-slate-800">
                  Verifiable Reference Implementations
                </p>
                <p className="mt-1">
                  Kubernetes & CI/CD: github.com/Shivam-Infra-Labs/mean-stack-example · LAMP to Compose: github.com/Shivam-Infra-Labs/Dockerized-grocery-store
                </p>
              </div>

              {/* Action Buttons (Screen Only) */}
              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-800/80 pt-6 print:hidden">
                <button
                  type="button"
                  onClick={handleSendScope}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Send This Scope to Shivam</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-100 whitespace-nowrap transition-colors hover:border-cyan-400/60 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Printer className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                  <span>Print / Save Scope PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyScope}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-300 whitespace-nowrap transition-colors hover:border-slate-700 hover:text-white"
                >
                  {copiedScope ? (
                    <Check
                      className="h-3.5 w-3.5 text-emerald-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{copiedScope ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </article>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
