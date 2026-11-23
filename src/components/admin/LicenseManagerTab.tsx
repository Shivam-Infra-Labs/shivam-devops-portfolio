'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  KeyRound,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { AdminField, adminInputClass } from './AdminShared';

interface IssuedLicenseRecord {
  key: string;
  buyerRef: string;
  issuedAt: string;
}

export function LicenseManagerTab() {
  const [buyerRef, setBuyerRef] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [latestKey, setLatestKey] = useState<IssuedLicenseRecord | null>(null);
  const [history, setHistory] = useState<IssuedLicenseRecord[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGenerating(true);

    try {
      const res = await fetch('/api/license/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buyerRef: buyerRef.trim() }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        key?: string;
        buyerRef?: string;
        issuedAt?: string;
        error?: string;
      };

      if (!res.ok || !payload.key) {
        setError(payload.error || 'Could not generate Pro license key.');
        return;
      }

      const record: IssuedLicenseRecord = {
        key: payload.key,
        buyerRef: payload.buyerRef || buyerRef.trim() || 'Direct Buyer',
        issuedAt: payload.issuedAt || new Date().toISOString(),
      };

      setLatestKey(record);
      setHistory((prev) => [record, ...prev]);
      setBuyerRef('');
    } catch {
      setError('Network error calling /api/license/generate.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
            <KeyRound className="h-5 w-5 text-cyan-300" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Tamper-Proof Pro License Key Generator
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Generates unique <code className="font-mono text-cyan-300">SHIVAM-PRO-XXXX-XXXX</code> keys signed server-side with HMAC-SHA256 using <code className="font-mono">ADMIN_PASSWORD</code>—zero database needed. Buyers validate keys live via <code className="font-mono">/api/license/verify</code> inside <code className="font-mono">/tools/generator</code>.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <AdminField
              label="Buyer Note / Platform Order ID (Optional)"
              hint="e.g. Razorpay #pay_9821 or Gumroad buyer email (for your current session log)"
            >
              <input
                type="text"
                value={buyerRef}
                onChange={(e) => setBuyerRef(e.target.value)}
                placeholder="Razorpay / Gumroad order reference..."
                className={adminInputClass}
              />
            </AdminField>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-2 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-cyan-300 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{generating ? 'Signing Key...' : 'Generate Pro License Key'}</span>
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {latestKey && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Signed Client Key Ready ({latestKey.buyerRef})</span>
              </p>
              <p className="mt-1 font-mono text-lg font-bold tracking-wider text-white">
                {latestKey.key}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleCopy(latestKey.key)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 whitespace-nowrap transition-colors hover:bg-emerald-300"
            >
              {copiedKey === latestKey.key ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {copiedKey === latestKey.key ? 'Copied Key' : 'Copy License Key'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Current Session Issued Keys */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="mb-3 text-sm font-bold text-white">
            Keys Generated in This Admin Session ({history.length})
          </h3>
          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/70">
            {history.map((item) => (
              <div
                key={item.key}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs"
              >
                <div>
                  <p className="font-mono font-bold text-cyan-300">{item.key}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {item.buyerRef} · Issued {item.issuedAt.slice(0, 19).replace('T', ' ')} UTC
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCopy(item.key)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/50 hover:text-white"
                >
                  {copiedKey === item.key ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedKey === item.key ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
