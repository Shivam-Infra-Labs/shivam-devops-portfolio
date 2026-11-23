'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileCode2,
  Folder,
  FolderOpen,
  Lock,
  ShieldAlert,
  Terminal,
  Unlock,
  UploadCloud,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';
import {
  ALL_ARTIFACT_IDS,
  ARTIFACT_CATALOG,
  ARTIFACT_DOMAINS,
  FREE_ARTIFACT_IDS,
} from '@/src/lib/infra-generator/catalog';
import {
  analyzeZipArchive,
  createSampleProjectZip,
} from '@/src/lib/infra-generator/zipAnalyzer';
import {
  exportArtifactsAsZip,
  generateSelectedArtifacts,
  type GeneratedFile,
} from '@/src/lib/infra-generator/generateBundle';
import type {
  CloudTarget,
  DatabaseChoice,
  DetectedStack,
  GeneratorParams,
  ZipAnalysisResult,
} from '@/src/lib/infra-generator/types';
import { ProLicenseModal, useProLicense } from './ProLicenseModal';

interface TreeFolderNode {
  name: string;
  fullPath: string;
  folders: TreeFolderNode[];
  files: GeneratedFile[];
}

function buildFolderTree(files: GeneratedFile[]): TreeFolderNode {
  const root: TreeFolderNode = {
    name: 'devsecops-bundle',
    fullPath: '',
    folders: [],
    files: [],
  };

  for (const file of files) {
    const segments = file.path.split('/');
    let current = root;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      const folderPath = segments.slice(0, i + 1).join('/');
      let child = current.folders.find((f) => f.name === seg);
      if (!child) {
        child = {
          name: seg,
          fullPath: folderPath,
          folders: [],
          files: [],
        };
        current.folders.push(child);
      }
      current = child;
    }
    current.files.push(file);
  }

  return root;
}

function FolderTreeView({
  node,
  depth,
  collapsedFolders,
  onToggleFolder,
  activeFileId,
  onSelectFile,
}: {
  node: TreeFolderNode;
  depth: number;
  collapsedFolders: Record<string, boolean>;
  onToggleFolder: (folderPath: string) => void;
  activeFileId: string;
  onSelectFile: (id: string) => void;
}) {
  const isRoot = depth === 0;
  const isCollapsed = !isRoot && Boolean(collapsedFolders[node.fullPath]);

  return (
    <div>
      {!isRoot && (
        <button
          type="button"
          onClick={() => onToggleFolder(node.fullPath)}
          style={{ paddingLeft: `${depth * 12}px` }}
          className="flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left font-mono text-xs text-slate-300 transition-colors hover:bg-slate-800/70 hover:text-white"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          )}
          {isCollapsed ? (
            <Folder className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          ) : (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
      )}

      {!isCollapsed && (
        <div>
          {node.folders.map((sub) => (
            <FolderTreeView
              key={sub.fullPath}
              node={sub}
              depth={depth + 1}
              collapsedFolders={collapsedFolders}
              onToggleFolder={onToggleFolder}
              activeFileId={activeFileId}
              onSelectFile={onSelectFile}
            />
          ))}
          {node.files.map((file) => {
            const fileName = file.path.split('/').pop() ?? file.path;
            const active = file.id === activeFileId;
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => onSelectFile(file.id)}
                style={{ paddingLeft: `${(depth + 1) * 12 + 6}px` }}
                className={`flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left font-mono text-xs transition-colors ${
                  active
                    ? 'bg-cyan-400/15 text-cyan-200 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <FileCode2
                  className={`h-3.5 w-3.5 shrink-0 ${
                    active ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{fileName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InfraGenerator() {
  const { data } = usePortfolio();
  const shouldReduceMotion = useSafeReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isProUnlocked, activateKey, deactivateKey } = useProLicense();
  const [proModalOpen, setProModalOpen] = useState(false);

  // Step 1: ZIP Analysis State
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [zipError, setZipError] = useState('');
  const [analysis, setAnalysis] = useState<ZipAnalysisResult | null>(null);

  // Step 2: Parameters & Selected Artifacts
  const [params, setParams] = useState<GeneratorParams>({
    appName: 'mean-stack-app',
    stack: 'node',
    runtimeVersion: data.generatorSettings.defaultBaseImage.replace(/^node:/, '') || '20-alpine',
    port: data.generatorSettings.defaultPort || 3000,
    database: 'mongodb',
    domain: 'app.example.com',
    cloudTarget: 'aws',
  });

  const [selectedIds, setSelectedIds] = useState<string[]>(FREE_ARTIFACT_IDS);

  // Step 3: Code Explorer State
  const [activeFileId, setActiveFileId] = useState<string>(FREE_ARTIFACT_IDS[0]);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [copiedFile, setCopiedFile] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);

  const effectiveSelectedIds = useMemo(() => {
    if (isProUnlocked) return selectedIds;
    return selectedIds.filter((id) => FREE_ARTIFACT_IDS.includes(id));
  }, [selectedIds, isProUnlocked]);

  const generatedFiles = useMemo(
    () => generateSelectedArtifacts(effectiveSelectedIds, params),
    [effectiveSelectedIds, params]
  );

  const folderTree = useMemo(
    () => buildFolderTree(generatedFiles),
    [generatedFiles]
  );

  const activeFile =
    generatedFiles.find((f) => f.id === activeFileId) ?? generatedFiles[0];

  const handleAnalyzeBlob = async (blob: File | Blob, filename: string) => {
    setAnalyzing(true);
    setZipError('');
    try {
      const res = await analyzeZipArchive(blob, filename);
      setAnalysis(res);
      setParams((prev) => ({
        ...prev,
        appName: res.suggestedAppName,
        stack: res.detectedStack,
        runtimeVersion: res.runtimeVersion,
        port: res.suggestedPort,
        database: res.suggestedDatabase,
      }));
    } catch {
      setZipError('Could not read ZIP archive. Please upload a valid .zip file.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    void handleAnalyzeBlob(file, file.name);
  };

  const handleLoadSample = async (sampleType: 'mean' | 'nextjs') => {
    const { blob, filename } = await createSampleProjectZip(sampleType);
    await handleAnalyzeBlob(blob, filename);
  };

  const handleToggleArtifact = (artifactId: string, isPro: boolean) => {
    if (isPro && !isProUnlocked) {
      setProModalOpen(true);
      return;
    }
    setSelectedIds((prev) => {
      const next = prev.includes(artifactId)
        ? prev.filter((id) => id !== artifactId)
        : [...prev, artifactId];
      return next;
    });
  };

  const handleToggleDomain = (domainId: string, isProDomain: boolean) => {
    if (isProDomain && !isProUnlocked) {
      setProModalOpen(true);
      return;
    }
    const domainIds = ARTIFACT_CATALOG.filter(
      (a) => a.domainId === domainId
    ).map((a) => a.id);

    const allSelected = domainIds.every((id) =>
      effectiveSelectedIds.includes(id)
    );

    setSelectedIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !domainIds.includes(id));
      }
      return Array.from(new Set([...prev, ...domainIds]));
    });
  };

  const handleSelectAllUnlocked = () => {
    setSelectedIds(isProUnlocked ? ALL_ARTIFACT_IDS : FREE_ARTIFACT_IDS);
  };

  const handleCopyActiveFile = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleDownloadBundle = async () => {
    if (generatedFiles.length === 0) return;
    setExportingZip(true);
    try {
      await exportArtifactsAsZip(generatedFiles, params.appName);
    } finally {
      setExportingZip(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/tools"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to DevOps Tools Hub</span>
            </Link>
            <p className="text-xs font-semibold tracking-wide text-cyan-400">
              100% Browser-Local · Zero Server Upload · {ARTIFACT_CATALOG.length} Production Artifacts
            </p>
            <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              DevSecOps & Cloud Infrastructure Generator
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Analyze any project ZIP in browser RAM, tune runtime parameters, select artifacts across 9 DevSecOps domains, and download a ready-to-commit bundle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isProUnlocked ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>DevSecOps Pro Suite Unlocked</span>
                <button
                  type="button"
                  onClick={deactivateKey}
                  className="ml-2 text-[11px] font-normal text-slate-300 underline hover:text-white"
                >
                  Lock
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setProModalOpen(true)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-cyan-300"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  Unlock DevSecOps Pro Suite ({data.generatorSettings.proPriceInr} /{' '}
                  {data.generatorSettings.proPriceUsd})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: Project ZIP Analyzer */}
        <section className="mb-8 rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Step 1 — Client-Side Project ZIP Analyzer
              </h2>
              <p className="text-xs text-slate-400">
                Inspects stack, dependencies, ports, and accidental secret files locally via JSZip.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleLoadSample('mean')}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
              >
                Load Sample Node/MEAN App
              </button>
              <button
                type="button"
                onClick={() => void handleLoadSample('nextjs')}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
              >
                Load Sample Next.js App
              </button>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileChange(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-7 text-center transition-colors ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-slate-700 bg-slate-950/70 hover:border-cyan-400/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={(e) => handleFileChange(e.target.files)}
              className="hidden"
            />
            <UploadCloud className="h-7 w-7 text-cyan-400" aria-hidden="true" />
            <p className="mt-2.5 text-sm font-semibold text-white">
              {analyzing
                ? 'Analyzing archive in browser RAM...'
                : 'Drop a project .zip here, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Auto-detects Node.js/Express, Next.js, PHP/LAMP, or Python + DB drivers
            </p>
          </div>

          {zipError && (
            <p role="alert" className="mt-3 text-xs font-medium text-rose-400">
              {zipError}
            </p>
          )}

          {analysis && (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-slate-200">
                  <span className="font-mono font-semibold text-emerald-300">
                    {analysis.archiveName}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span>{analysis.fileCount} files scanned</span>
                  <span className="text-slate-500">·</span>
                  <span>
                    Detected: <strong className="text-white">{analysis.stackLabel}</strong> (
                    {analysis.runtimeVersion})
                  </span>
                </div>
                <span className="font-mono text-[11px] text-cyan-300">
                  Signals: {analysis.matchedSignals.join(', ')}
                </span>
              </div>

              {analysis.sensitiveFilesFound.length > 0 && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-200"
                >
                  <ShieldAlert
                    className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-bold text-rose-300">
                      Security Warning: Sensitive Files Detected Inside ZIP
                    </p>
                    <p className="mt-1 text-slate-200">
                      Found{' '}
                      <code className="font-mono text-rose-300">
                        {analysis.sensitiveFilesFound.join(', ')}
                      </code>
                      . Remove secret files from Git/images and use the generated{' '}
                      <code className="font-mono text-cyan-300">.dockerignore</code> and{' '}
                      <code className="font-mono text-cyan-300">.env.example</code> instead.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* STEP 2: Parameters & 9-Domain File Matrix */}
        <section className="mb-8 rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Step 2 — Parameters & 9-Domain DevSecOps File Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Customize runtime inputs and choose exact artifacts ({effectiveSelectedIds.length} selected).
              </p>
            </div>

            <button
              type="button"
              onClick={handleSelectAllUnlocked}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/50 hover:text-white"
            >
              {isProUnlocked
                ? 'Select All 35 Artifacts'
                : 'Select All Free Artifacts'}
            </button>
          </div>

          {/* Runtime Parameters */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label className="block text-xs font-semibold text-slate-200">
                App Name
              </label>
              <input
                type="text"
                value={params.appName}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    appName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  }))
                }
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 font-mono text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Stack
              </label>
              <select
                value={params.stack}
                onChange={(e) => {
                  const nextStack = e.target.value as DetectedStack;
                  const defaultRuntime =
                    nextStack === 'php'
                      ? '8.3-apache'
                      : nextStack === 'python'
                      ? '3.12-slim'
                      : '20-alpine';
                  const defaultPort =
                    nextStack === 'php' ? 80 : nextStack === 'python' ? 8000 : 3000;
                  setParams((p) => ({
                    ...p,
                    stack: nextStack,
                    runtimeVersion: defaultRuntime,
                    port: defaultPort,
                  }));
                }}
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs text-white"
              >
                <option value="node">Node.js / Express</option>
                <option value="nextjs">Next.js</option>
                <option value="php">PHP / LAMP</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Port
              </label>
              <input
                type="number"
                value={params.port}
                onChange={(e) =>
                  setParams((p) => ({ ...p, port: Number(e.target.value) || 3000 }))
                }
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 font-mono text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Database
              </label>
              <select
                value={params.database}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    database: e.target.value as DatabaseChoice,
                  }))
                }
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs text-white"
              >
                <option value="none">None</option>
                <option value="mongodb">MongoDB</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="redis">Redis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Domain Name
              </label>
              <input
                type="text"
                value={params.domain}
                onChange={(e) => setParams((p) => ({ ...p, domain: e.target.value }))}
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 font-mono text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Cloud Target
              </label>
              <select
                value={params.cloudTarget}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    cloudTarget: e.target.value as CloudTarget,
                  }))
                }
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs text-white"
              >
                <option value="aws">AWS</option>
                <option value="digitalocean">DigitalOcean</option>
                <option value="linux-vps">Linux VPS</option>
              </select>
            </div>
          </div>

          {/* 9-Domain Matrix */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ARTIFACT_DOMAINS.map((dom) => {
              const domainArtifacts = ARTIFACT_CATALOG.filter(
                (a) => a.domainId === dom.id
              );
              const isProDomain = dom.tier === 'pro';
              const isLocked = isProDomain && !isProUnlocked;
              const selectedCount = domainArtifacts.filter((a) =>
                effectiveSelectedIds.includes(a.id)
              ).length;

              return (
                <div
                  key={dom.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 ${
                    isLocked
                      ? 'border-slate-800/80 bg-slate-950/50'
                      : 'border-slate-800 bg-slate-950/85'
                  }`}
                >
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[11px] text-cyan-400 tabular-nums">
                          {dom.number} · {isProDomain ? 'Pro Suite' : 'Free Tier'}
                        </p>
                        <h3 className="text-sm font-bold text-white">
                          {dom.label}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleDomain(dom.id, isProDomain)}
                        className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                          isLocked
                            ? 'border-amber-500/35 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                            : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-400/50 hover:text-white'
                        }`}
                      >
                        {isLocked
                          ? 'Unlock'
                          : selectedCount === domainArtifacts.length
                          ? 'Clear'
                          : 'Select All'}
                      </button>
                    </div>

                    <p className="mb-3 text-[11px] leading-snug text-slate-400">
                      {dom.summary}
                    </p>

                    <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                      {domainArtifacts.map((art) => {
                        const checked = effectiveSelectedIds.includes(art.id);
                        return (
                          <button
                            key={art.id}
                            type="button"
                            onClick={() => handleToggleArtifact(art.id, art.isPro)}
                            className="flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-slate-900"
                          >
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                isLocked
                                  ? 'border-slate-700 bg-slate-900 text-slate-500'
                                  : checked
                                  ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                                  : 'border-slate-600 bg-slate-950'
                              }`}
                            >
                              {isLocked ? (
                                <Lock className="h-2.5 w-2.5" />
                              ) : (
                                checked && <Check className="h-3 w-3" />
                              )}
                            </span>
                            <span className="block min-w-0">
                              <span className="block truncate font-mono text-[11px] text-slate-200">
                                {art.path}
                              </span>
                              <span className="block truncate text-[10px] text-slate-500">
                                {art.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEP 3: Interactive Folder-Tree Code Explorer & ZIP Export */}
        <section className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Step 3 — Interactive Folder-Tree Code Explorer & ZIP Export
              </h2>
              <p className="text-xs text-slate-400">
                Preview dynamically interpolated configurations and export the complete bundle.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleDownloadBundle()}
              disabled={generatedFiles.length === 0 || exportingZip}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-400 px-5 py-2.5 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-emerald-300 disabled:opacity-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>
                {exportingZip
                  ? 'Building ZIP...'
                  : `Download Complete DevSecOps Bundle (.zip) · ${generatedFiles.length} files`}
              </span>
            </button>
          </div>

          {generatedFiles.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-xs text-slate-400">
              Select at least one artifact in Step 2 to inspect and export.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Collapsible Folder Tree */}
              <div className="max-h-[520px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/90 p-3 lg:col-span-4">
                <p className="mb-2 px-2 font-mono text-[11px] font-semibold text-slate-400">
                  {params.appName || 'my-app'}/ ({generatedFiles.length} files)
                </p>
                <FolderTreeView
                  node={folderTree}
                  depth={0}
                  collapsedFolders={collapsedFolders}
                  onToggleFolder={(path) =>
                    setCollapsedFolders((prev) => ({
                      ...prev,
                      [path]: !prev[path],
                    }))
                  }
                  activeFileId={activeFile?.id ?? ''}
                  onSelectFile={(id) => {
                    setActiveFileId(id);
                    setCopiedFile(false);
                  }}
                />
              </div>

              {/* Active File Viewer */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 lg:col-span-8">
                {activeFile && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-semibold text-cyan-300">
                          {activeFile.path}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {activeFile.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleCopyActiveFile()}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
                      >
                        {copiedFile ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{copiedFile ? 'Copied' : 'Copy File'}</span>
                      </button>
                    </div>
                    <pre className="max-h-[460px] flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
                      {activeFile.content}
                    </pre>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Start Verification Commands */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/85 p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Terminal className="h-4 w-4" aria-hidden="true" />
              <span>Quick Start Verification Commands</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-[11px] font-medium text-slate-400">
                  Local Compose Build & Security Scan
                </p>
                <pre className="mt-1.5 overflow-x-auto font-mono text-xs text-emerald-300">
                  {`cp .env.example .env\ndocker compose up -d --build\ntrivy image --severity CRITICAL,HIGH ${params.appName}:local`}
                </pre>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-[11px] font-medium text-slate-400">
                  Kubernetes & Terraform Dry-Run
                </p>
                <pre className="mt-1.5 overflow-x-auto font-mono text-xs text-cyan-300">
                  {`kubectl apply -f k8s/\nterraform -chdir=terraform init && terraform -chdir=terraform plan`}
                </pre>
              </div>
            </div>
          </div>

          {!isProUnlocked && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                Free tier includes all 5 Containers artifacts. Unlock the DevSecOps Pro Suite to export Kubernetes, Helm, DevSecOps CI, Terraform, Ansible, and Observability suites.
              </span>
            </div>
          )}
        </section>
      </motion.div>

      <ProLicenseModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onUnlocked={() => setSelectedIds(ALL_ARTIFACT_IDS)}
        activateKey={activateKey}
      />
    </div>
  );
}
