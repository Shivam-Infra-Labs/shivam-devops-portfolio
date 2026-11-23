'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import { Check, Copy, FileCode2, Info } from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

interface AnnotatedLine {
  lineNumber: number;
  code: string;
  noteTitle?: string;
  noteBody?: string;
}

const DOCKERFILE_LINES: AnnotatedLine[] = [
  {
    lineNumber: 1,
    code: 'FROM node:20-alpine AS deps',
    noteTitle: 'Minimal Alpine Base Image',
    noteBody:
      'Using node:20-alpine instead of full Debian reduces final image size and shrinks the OS package attack surface for production builds.',
  },
  {
    lineNumber: 2,
    code: 'WORKDIR /app',
  },
  {
    lineNumber: 3,
    code: 'COPY package.json package-lock.json ./',
    noteTitle: 'Dependency Manifest Layer Isolation',
    noteBody:
      'Copying lockfiles before application source ensures Docker reuses the cached dependency layer whenever source files change without dependency edits.',
  },
  {
    lineNumber: 4,
    code: 'RUN npm ci --omit=dev',
    noteTitle: 'Deterministic CI Install',
    noteBody:
      'npm ci installs exact lockfile versions and skips devDependencies, guaranteeing reproducible builds between local dev and GitHub Actions.',
  },
  {
    lineNumber: 5,
    code: '',
  },
  {
    lineNumber: 6,
    code: 'FROM node:20-alpine AS runner',
    noteTitle: 'Multi-Stage Runtime Separation',
    noteBody:
      'Starts a fresh runtime stage so build caches and unnecessary intermediate artifacts are excluded from the deployed container.',
  },
  {
    lineNumber: 7,
    code: 'WORKDIR /app',
  },
  {
    lineNumber: 8,
    code: 'USER node',
    noteTitle: 'Non-Root Container Execution',
    noteBody:
      'Drops root privileges inside the container so compromised app processes cannot modify system binaries or write outside owned paths.',
  },
  {
    lineNumber: 9,
    code: 'COPY --from=deps /app/node_modules ./node_modules',
  },
  {
    lineNumber: 10,
    code: 'COPY . .',
  },
  {
    lineNumber: 11,
    code: 'EXPOSE 3000',
  },
  {
    lineNumber: 12,
    code: 'CMD ["node", "server.js"]',
    noteTitle: 'Exec-Form Entrypoint',
    noteBody:
      'JSON exec form runs Node directly as PID 1 so SIGTERM shutdown signals from Kubernetes or Docker Compose reach the process cleanly.',
  },
];

const COMPOSE_LINES: AnnotatedLine[] = [
  {
    lineNumber: 1,
    code: 'services:',
  },
  {
    lineNumber: 2,
    code: '  nginx:',
    noteTitle: 'Single Public Ingress Point',
    noteBody:
      'Only Nginx publishes ports to the host machine; downstream API and database containers stay unreachable from outside the Docker bridge.',
  },
  {
    lineNumber: 3,
    code: '    image: nginx:1.25-alpine',
  },
  {
    lineNumber: 4,
    code: '    ports: ["80:80"]',
  },
  {
    lineNumber: 5,
    code: '    depends_on:',
  },
  {
    lineNumber: 6,
    code: '      api:',
  },
  {
    lineNumber: 7,
    code: '        condition: service_healthy',
    noteTitle: 'Healthcheck-Gated Startup',
    noteBody:
      'Prevents 502 Bad Gateway errors on cold boot by waiting until the API healthcheck endpoint passes before routing proxy traffic.',
  },
  {
    lineNumber: 8,
    code: '    networks: [edge-net, app-net]',
  },
  {
    lineNumber: 9,
    code: '  api:',
  },
  {
    lineNumber: 10,
    code: '    build: ./api',
  },
  {
    lineNumber: 11,
    code: '    env_file: [.env]',
  },
  {
    lineNumber: 12,
    code: '    healthcheck:',
  },
  {
    lineNumber: 13,
    code: '      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]',
  },
  {
    lineNumber: 14,
    code: '    networks: [app-net]',
    noteTitle: 'Internal Network Isolation',
    noteBody:
      'Services communicate using internal Docker DNS names (e.g., http://api:3000) on app-net without exposing raw backend ports to the host.',
  },
  {
    lineNumber: 15,
    code: '  db:',
  },
  {
    lineNumber: 16,
    code: '    image: mongo:7',
  },
  {
    lineNumber: 17,
    code: '    volumes: ["db-data:/data/db"]',
    noteTitle: 'Named Persistent Volume',
    noteBody:
      'Binds database files to a Docker-managed volume so container rebuilds or upgrades preserve data safely.',
  },
  {
    lineNumber: 18,
    code: '    networks: [app-net]',
  },
  {
    lineNumber: 19,
    code: 'volumes:',
  },
  {
    lineNumber: 20,
    code: '  db-data: {}',
  },
  {
    lineNumber: 21,
    code: 'networks:',
  },
  {
    lineNumber: 22,
    code: '  edge-net: {}',
  },
  {
    lineNumber: 23,
    code: '  app-net:',
  },
  {
    lineNumber: 24,
    code: '    internal: true',
    noteTitle: 'Air-Gapped Database Subnet',
    noteBody:
      'Setting internal: true blocks outbound internet egress from the database network while permitting intra-stack API queries.',
  },
];

export function AnnotatedConfigs() {
  const { data } = usePortfolio();
  const shouldReduceMotion = useSafeReducedMotion();
  const [activeTab, setActiveTab] = useState<'dockerfile' | 'compose'>('dockerfile');
  const [selectedLine, setSelectedLine] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const lines = activeTab === 'dockerfile' ? DOCKERFILE_LINES : COMPOSE_LINES;
  const annotatedEntries = lines.filter((l) => l.noteTitle && l.noteBody);
  const activeNote =
    lines.find((l) => l.lineNumber === selectedLine && l.noteTitle) ??
    annotatedEntries[0];

  const handleTabSwitch = (tab: 'dockerfile' | 'compose') => {
    setActiveTab(tab);
    const nextLines = tab === 'dockerfile' ? DOCKERFILE_LINES : COMPOSE_LINES;
    const firstAnnotated = nextLines.find((l) => l.noteTitle);
    setSelectedLine(firstAnnotated?.lineNumber ?? 1);
  };

  const handleCopy = async () => {
    const rawText = lines.map((l) => l.code).join('\n');
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <section
      id="configs"
      className="scroll-mt-20 border-b border-slate-800/70 bg-slate-950 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-cyan-400">
                Annotated Infrastructure Blueprints
              </p>
              <h2 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Production Dockerfile & Compose Patterns
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400 sm:text-base">
                Tap any highlighted line to inspect the reasoning behind image hardening, Docker layer caching, and network isolation.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('dockerfile')}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'dockerfile'
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Dockerfile
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('compose')}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'compose'
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  compose.yaml
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Code Panel */}
            <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <FileCode2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                  <span>
                    {activeTab === 'dockerfile' ? 'Dockerfile' : 'compose.yaml'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[11px] text-slate-400">
                    {annotatedEntries.length} annotated lines
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="overflow-x-auto bg-slate-950/90 py-3 font-mono text-xs">
                {lines.map((line) => {
                  const hasNote = Boolean(line.noteTitle);
                  const isActive =
                    hasNote && activeNote?.lineNumber === line.lineNumber;

                  if (!hasNote) {
                    return (
                      <div
                        key={line.lineNumber}
                        className="flex items-center px-4 py-1 text-slate-400"
                      >
                        <span className="w-8 shrink-0 select-none text-slate-600 tabular-nums">
                          {line.lineNumber}
                        </span>
                        <span className="whitespace-pre">{line.code || ' '}</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={line.lineNumber}
                      type="button"
                      onClick={() => setSelectedLine(line.lineNumber)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-1.5 text-left transition-colors ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-200'
                          : 'bg-slate-900/40 text-slate-200 hover:bg-cyan-500/10'
                      }`}
                    >
                      <span className="flex items-center min-w-0">
                        <span className="w-8 shrink-0 select-none text-cyan-400 tabular-nums">
                          {line.lineNumber}
                        </span>
                        <span className="whitespace-pre">{line.code}</span>
                      </span>
                      <span className="shrink-0 rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-300">
                        Note
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Engineering Annotation Panel */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 lg:col-span-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    Line {activeNote?.lineNumber} · Engineering Rationale
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-white">
                  {activeNote?.noteTitle}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  {activeNote?.noteBody}
                </p>

                <div className="mt-6 border-t border-slate-800/80 pt-5">
                  <p className="mb-2.5 text-xs font-semibold text-slate-400">
                    Jump to Annotated Lines
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {annotatedEntries.map((entry) => {
                      const active = activeNote?.lineNumber === entry.lineNumber;
                      return (
                        <button
                          key={entry.lineNumber}
                          type="button"
                          onClick={() => setSelectedLine(entry.lineNumber)}
                          className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                            active
                              ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                              : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          L{entry.lineNumber}: {entry.noteTitle}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic defaults read from PortfolioContext generatorSettings */}
              <div className="mt-6 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                <p className="font-mono text-[11px] text-slate-300">
                  Defaults: {data.generatorSettings.defaultBaseImage} · Port{' '}
                  {data.generatorSettings.defaultPort} · Healthcheck{' '}
                  {data.generatorSettings.enableHealthcheck ? 'Enabled' : 'Off'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
