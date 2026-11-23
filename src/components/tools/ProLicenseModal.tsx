'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

const PRO_LICENSE_STORAGE_KEY = 'shivam_devsecops_pro_license_v1';
const PRO_LICENSE_EVENT = 'shivam-pro-license-change';

function subscribeLicense(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === PRO_LICENSE_STORAGE_KEY) callback();
  };
  const onCustom = () => callback();
  window.addEventListener('storage', onStorage);
  window.addEventListener(PRO_LICENSE_EVENT, onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(PRO_LICENSE_EVENT, onCustom);
  };
}

function getSavedLicenseKeySnapshot(): string {
  if (typeof window === 'undefined') return '';
  try {
    return (window.localStorage.getItem(PRO_LICENSE_STORAGE_KEY) ?? '').trim();
  } catch {
    return '';
  }
}

function getServerLicenseKeySnapshot(): string {
  return '';
}

export interface ActivateKeyResult {
  valid: boolean;
  error?: string;
}

export function useProLicense() {
  const savedKey = React.useSyncExternalStore(
    subscribeLicense,
    getSavedLicenseKeySnapshot,
    getServerLicenseKeySnapshot
  );

  const [verifiedKey, setVerifiedKey] = useState<string>('');

  // Re-verify any previously saved key against server HMAC verifier
  useEffect(() => {
    if (!savedKey) return;
    let active = true;

    fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: savedKey }),
    })
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!active) return;
        const payload = body as { valid?: boolean };
        if (ok && payload.valid) {
          setVerifiedKey(savedKey);
        } else {
          setVerifiedKey('');
          try {
            window.localStorage.removeItem(PRO_LICENSE_STORAGE_KEY);
            window.dispatchEvent(new Event(PRO_LICENSE_EVENT));
          } catch {
            // Ignore storage errors
          }
        }
      })
      .catch(() => {
        // Keep unverified if offline
      });

    return () => {
      active = false;
    };
  }, [savedKey]);

  const isProUnlocked = Boolean(savedKey && verifiedKey === savedKey);

  const activateKey = async (rawKey: string): Promise<ActivateKeyResult> => {
    const trimmed = rawKey.trim();
    if (!trimmed) {
      return { valid: false, error: 'Please enter a Pro license key.' };
    }

    try {
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: trimmed }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        valid?: boolean;
        error?: string;
      };

      if (!res.ok || !payload.valid) {
        return {
          valid: false,
          error:
            payload.error ||
            'Invalid license key. Enter an issued SHIVAM-PRO-XXXX-XXXX key or owner master key.',
        };
      }

      setVerifiedKey(trimmed);
      try {
        window.localStorage.setItem(PRO_LICENSE_STORAGE_KEY, trimmed);
        window.dispatchEvent(new Event(PRO_LICENSE_EVENT));
      } catch {
        // Ignore storage errors
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: 'Network error verifying license key.',
      };
    }
  };

  const deactivateKey = () => {
    setVerifiedKey('');
    try {
      window.localStorage.removeItem(PRO_LICENSE_STORAGE_KEY);
      window.dispatchEvent(new Event(PRO_LICENSE_EVENT));
    } catch {
      // Ignore storage errors
    }
  };

  return { isProUnlocked, activateKey, deactivateKey };
}

interface ProLicenseModalProps {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  activateKey: (key: string) => Promise<ActivateKeyResult>;
}

export function ProLicenseModal({
  open,
  onClose,
  onUnlocked,
  activateKey,
}: ProLicenseModalProps) {
  const { data } = usePortfolio();
  const { generatorSettings } = data;

  const [licenseInput, setLicenseInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const result = await activateKey(licenseInput);
      if (result.valid) {
        setLicenseInput('');
        onUnlocked();
        onClose();
      } else {
        setError(
          result.error ||
            'Invalid license key. Enter your issued SHIVAM-PRO-XXXX-XXXX key or your configured owner master key.'
        );
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Unlock DevSecOps Pro Suite"
            className="w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10">
                  <Lock className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Unlock DevSecOps Pro Suite
                  </h2>
                  <p className="text-xs text-slate-400">
                    {generatorSettings.proPlanLabel} ·{' '}
                    <span className="font-mono text-cyan-300">
                      {generatorSettings.proPriceInr} /{' '}
                      {generatorSettings.proPriceUsd}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
              <p className="font-semibold text-white">
                Unlocks all 8 Production & DevSecOps Domains (30+ extra files):
              </p>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Gitleaks, Semgrep, Checkov, Trivy gate & Syft SBOM CI</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Hardened Kubernetes, NetworkPolicy, Kyverno & Helm Charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Terraform Cloud IaC, Ansible UFW/SSH hardening & Prometheus/Grafana</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3.5">
              <div className="text-xs text-slate-200">
                <p className="font-semibold text-white">Need a License Key?</p>
                <p className="text-slate-300">
                  One-time {generatorSettings.proPriceInr} ({generatorSettings.proPriceUsd})
                </p>
              </div>
              <a
                href={generatorSettings.paymentUrl}
                target={
                  generatorSettings.paymentUrl.startsWith('mailto:')
                    ? undefined
                    : '_blank'
                }
                rel={
                  generatorSettings.paymentUrl.startsWith('mailto:')
                    ? undefined
                    : 'noopener noreferrer'
                }
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-slate-950 whitespace-nowrap hover:bg-cyan-300"
              >
                <span>Get Pro License</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="pro-license-key"
                  className="block text-xs font-semibold text-slate-200"
                >
                  Enter License Key or Owner Master Key
                </label>
                <div className="relative mt-1.5">
                  <KeyRound
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    aria-hidden="true"
                  />
                  <input
                    id="pro-license-key"
                    type="password"
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    placeholder="SHIVAM-PRO-XXXX-XXXX"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950/90 py-2.5 pl-9 pr-4 font-mono text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Verified via server-side HMAC-SHA256</span>
                </span>
                <button
                  type="submit"
                  disabled={verifying}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-emerald-400 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
                >
                  {verifying ? 'Verifying...' : 'Activate Key'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
