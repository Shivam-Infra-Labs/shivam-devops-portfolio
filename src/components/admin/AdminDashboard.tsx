'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  GitCommitHorizontal,
  KeyRound,
  LogOut,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';
import { IdentityHeroTab } from './IdentityHeroTab';
import { FeaturedProjectTab } from './FeaturedProjectTab';
import { ProjectsLabsTab } from './ProjectsLabsTab';
import { EducationCertsTab } from './EducationCertsTab';
import { ServicesContactTab } from './ServicesContactTab';
import { IncidentsGeneratorTab } from './IncidentsGeneratorTab';
import { LicenseManagerTab } from './LicenseManagerTab';
import { AdminField, adminInputClass, adminMonoInputClass } from './AdminShared';

type AdminTabId =
  | 'identity'
  | 'featured'
  | 'projects'
  | 'education'
  | 'services'
  | 'incidents'
  | 'licenses';

const TABS: { id: AdminTabId; label: string }[] = [
  { id: 'identity', label: '1. Identity, Hero & Links' },
  { id: 'featured', label: '2. Featured Project' },
  { id: 'projects', label: '3. Projects & Labs' },
  { id: 'education', label: '4. Education & Certs' },
  { id: 'services', label: '5. Services & Contact' },
  { id: 'incidents', label: '6. Incidents & Generator' },
  { id: 'licenses', label: '7. License Manager' },
];

const SESSION_TOKEN_KEY = 'shivam_admin_gh_pat';
const SESSION_TOKEN_EVENT = 'shivam-admin-gh-pat-change';

function subscribeSessionToken(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCustom = () => callback();
  window.addEventListener(SESSION_TOKEN_EVENT, onCustom);
  return () => window.removeEventListener(SESSION_TOKEN_EVENT, onCustom);
}

function getSessionTokenSnapshot(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(SESSION_TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

function getSessionTokenServerSnapshot(): string {
  return '';
}

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface AdminDashboardProps {
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export function AdminDashboard({
  onLogout,
  isLoggingOut = false,
}: AdminDashboardProps) {
  const { data, isDraftActive, updateDraft, resetDraft } = usePortfolio();
  const [activeTab, setActiveTab] = useState<AdminTabId>('identity');
  const [confirmReset, setConfirmReset] = useState(false);

  // GitHub Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [ghOwner, setGhOwner] = useState('Shivam-Infra-Labs');
  const [ghRepo, setGhRepo] = useState('devops-portfolio');
  const [ghBranch, setGhBranch] = useState('main');
  const [ghPath, setGhPath] = useState('src/data/portfolio.json');
  const [ghCommitMsg, setGhCommitMsg] = useState(
    'chore(content): update portfolio.json via admin panel'
  );
  const ghToken = useSyncExternalStore(
    subscribeSessionToken,
    getSessionTokenSnapshot,
    getSessionTokenServerSnapshot
  );
  const [publishStatus, setPublishStatus] = useState<
    'idle' | 'publishing' | 'success' | 'error'
  >('idle');
  const [publishMessage, setPublishMessage] = useState('');
  const [commitUrl, setCommitUrl] = useState('');

  const handleExportJson = () => {
    const formatted = JSON.stringify(data, null, 2);
    const blob = new Blob([formatted], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'portfolio.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleTokenChange = (value: string) => {
    try {
      if (value.trim()) {
        window.sessionStorage.setItem(SESSION_TOKEN_KEY, value.trim());
      } else {
        window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
      }
      window.dispatchEvent(new Event(SESSION_TOKEN_EVENT));
    } catch {
      // Ignore sessionStorage errors
    }
  };

  const handlePublishToGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = ghToken.trim();
    const owner = ghOwner.trim();
    const repo = ghRepo.trim();
    const branch = ghBranch.trim() || 'main';
    const path = ghPath.trim().replace(/^\/+/, '');

    if (!token || !owner || !repo || !path) {
      setPublishStatus('error');
      setPublishMessage(
        'Please provide Owner, Repository, File Path, and your Fine-Grained GitHub Token.'
      );
      return;
    }

    setPublishStatus('publishing');
    setPublishMessage('');
    setCommitUrl('');

    const apiBase = `https://api.github.com/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}/contents/${path
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`;

    try {
      // Step 1: Lookup existing file SHA (if it exists)
      let currentSha: string | undefined;
      const getRes = await fetch(
        `${apiBase}?ref=${encodeURIComponent(branch)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );

      if (getRes.ok) {
        const getData = (await getRes.json()) as { sha?: string };
        currentSha = getData.sha;
      } else if (getRes.status !== 404) {
        const errPayload = (await getRes.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(
          errPayload.message ||
            `GitHub returned status ${getRes.status} while inspecting ${path}.`
        );
      }

      // Step 2: Commit updated portfolio.json
      const formattedJson = JSON.stringify(data, null, 2) + '\n';
      const putRes = await fetch(apiBase, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message:
            ghCommitMsg.trim() ||
            'chore(content): update portfolio.json via admin panel',
          content: utf8ToBase64(formattedJson),
          branch,
          ...(currentSha ? { sha: currentSha } : {}),
        }),
      });

      const putData = (await putRes.json().catch(() => ({}))) as {
        message?: string;
        commit?: { html_url?: string; sha?: string };
      };

      if (!putRes.ok) {
        throw new Error(
          putData.message ||
            `GitHub commit failed with status ${putRes.status}.`
        );
      }

      setPublishStatus('success');
      setPublishMessage(
        `Committed ${path} to ${owner}/${repo}@${branch}. Automatic CI/CD deployment triggered.`
      );
      setCommitUrl(putData.commit?.html_url ?? '');
    } catch (err) {
      setPublishStatus('error');
      setPublishMessage(
        err instanceof Error
          ? err.message
          : 'Failed to publish portfolio.json to GitHub.'
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Persistence & Publishing Header */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-mono font-semibold text-cyan-400">
                Website Admin Panel
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span
                className={
                  isDraftActive
                    ? 'font-medium text-amber-300'
                    : 'font-medium text-emerald-300'
                }
              >
                {isDraftActive
                  ? 'Local Draft Active (Saved in browser localStorage)'
                  : 'Synced with Repo Default (src/data/portfolio.json)'}
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Manage 100% of Portfolio Content
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400 sm:text-sm">
              All edits auto-save immediately to browser localStorage for instant preview, with zero hardcoded secrets. Export or publish directly to GitHub when ready.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white"
            >
              <Eye className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              <span>Preview Live Site</span>
            </Link>

            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Export portfolio.json</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPublishStatus('idle');
                setPublishMessage('');
                setPublishModalOpen(true);
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-cyan-300"
            >
              <GitCommitHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>Publish Live to GitHub</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-200 whitespace-nowrap transition-colors hover:bg-rose-500/20 hover:text-white disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isLoggingOut ? 'Locking...' : 'Lock / Logout'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Reset / Discard Draft Confirmation Strip */}
        {isDraftActive && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-300">
              You have local draft overrides active in this browser.
            </p>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Discard Draft / Reset to Repo Default</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300">
                  Reset all local edits?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    resetDraft();
                    setConfirmReset(false);
                  }}
                  className="rounded-md bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-400"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6 Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Admin content sections"
        className="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-4"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div>
        {activeTab === 'identity' && (
          <IdentityHeroTab data={data} onChange={updateDraft} />
        )}
        {activeTab === 'featured' && (
          <FeaturedProjectTab data={data} onChange={updateDraft} />
        )}
        {activeTab === 'projects' && (
          <ProjectsLabsTab data={data} onChange={updateDraft} />
        )}
        {activeTab === 'education' && (
          <EducationCertsTab data={data} onChange={updateDraft} />
        )}
        {activeTab === 'services' && (
          <ServicesContactTab data={data} onChange={updateDraft} />
        )}
        {activeTab === 'incidents' && (
          <IncidentsGeneratorTab data={data} onChange={updateDraft} />
        )}
        {activeTab === 'licenses' && <LicenseManagerTab />}
      </div>

      {/* Publish Live to GitHub Modal */}
      <AnimatePresence>
        {publishModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
            onClick={() => setPublishModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Publish portfolio.json to GitHub"
              className="w-full max-w-xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Publish Live to GitHub
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Commits updated <code className="text-cyan-300">src/data/portfolio.json</code> via GitHub REST API.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  aria-label="Close publish modal"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                <span>
                  Your fine-grained PAT is held in <code className="font-mono">sessionStorage</code> for this browser session only and is never bundled or committed.
                </span>
              </div>

              <form onSubmit={handlePublishToGitHub} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminField label="GitHub Owner">
                    <input
                      type="text"
                      value={ghOwner}
                      onChange={(e) => setGhOwner(e.target.value)}
                      className={adminMonoInputClass}
                    />
                  </AdminField>
                  <AdminField label="Repository Name">
                    <input
                      type="text"
                      value={ghRepo}
                      onChange={(e) => setGhRepo(e.target.value)}
                      className={adminMonoInputClass}
                    />
                  </AdminField>
                  <AdminField label="Branch">
                    <input
                      type="text"
                      value={ghBranch}
                      onChange={(e) => setGhBranch(e.target.value)}
                      className={adminMonoInputClass}
                    />
                  </AdminField>
                  <AdminField label="Target JSON Path">
                    <input
                      type="text"
                      value={ghPath}
                      onChange={(e) => setGhPath(e.target.value)}
                      className={adminMonoInputClass}
                    />
                  </AdminField>
                </div>

                <AdminField label="Commit Message">
                  <input
                    type="text"
                    value={ghCommitMsg}
                    onChange={(e) => setGhCommitMsg(e.target.value)}
                    className={adminInputClass}
                  />
                </AdminField>

                <AdminField
                  label="Fine-Grained GitHub Personal Access Token"
                  hint="Requires Contents: Read and Write permission on the target repository."
                >
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <KeyRound
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        aria-hidden="true"
                      />
                      <input
                        type="password"
                        value={ghToken}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        placeholder="github_pat_..."
                        className={`${adminMonoInputClass} pl-9`}
                      />
                    </div>
                    {ghToken && (
                      <button
                        type="button"
                        onClick={() => handleTokenChange('')}
                        className="rounded-lg border border-slate-700 px-3 py-2.5 text-xs text-slate-300 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </AdminField>

                {publishStatus === 'error' && publishMessage && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span>{publishMessage}</span>
                  </div>
                )}

                {publishStatus === 'success' && publishMessage && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{publishMessage}</span>
                    </div>
                    {commitUrl && (
                      <a
                        href={commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 font-semibold text-cyan-300 underline"
                      >
                        <span>View Commit on GitHub</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setPublishModalOpen(false)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={publishStatus === 'publishing'}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
                  >
                    <GitCommitHorizontal className="h-4 w-4" />
                    <span>
                      {publishStatus === 'publishing'
                        ? 'Committing...'
                        : 'Commit portfolio.json'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
