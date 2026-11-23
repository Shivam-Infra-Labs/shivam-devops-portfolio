'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';

interface AdminAuthGateProps {
  initialAuthenticated: boolean;
  initialConfigured: boolean;
}

interface AuthStatusResponse {
  authenticated: boolean;
  configured: boolean;
  error?: string;
}

export function AdminAuthGate({
  initialAuthenticated,
  initialConfigured,
}: AdminAuthGateProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [configured, setConfigured] = useState(initialConfigured);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Re-verify session status with server on mount (handles bfcache/session expiry)
  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth', {
      method: 'GET',
      cache: 'no-store',
    })
      .then((res) => res.json() as Promise<AuthStatusResponse>)
      .then((payload) => {
        if (!active) return;
        setAuthenticated(Boolean(payload.authenticated));
        setConfigured(Boolean(payload.configured));
      })
      .catch(() => {
        // Keep initial SSR state if offline/transient error
      });

    return () => {
      active = false;
    };
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password) {
      setErrorMessage('Enter the admin password to unlock.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await res.json().catch(() => ({}))) as AuthStatusResponse;
      if (typeof payload.configured === 'boolean') {
        setConfigured(payload.configured);
      }

      if (res.ok && payload.authenticated) {
        setPassword('');
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        setErrorMessage(
          payload.error || 'Authentication failed. Check your admin password.'
        );
      }
    } catch {
      setErrorMessage('Network error verifying admin credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
      });
    } finally {
      setAuthenticated(false);
      setPassword('');
      setErrorMessage('');
      setLoggingOut(false);
    }
  };

  if (authenticated) {
    return <AdminDashboard onLogout={handleLogout} isLoggingOut={loggingOut} />;
  }

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-lg items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-2xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
            <Lock className="h-5 w-5 text-cyan-300" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold text-cyan-400">
              Protected Route · /admin
            </p>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Admin Access Gate
            </h1>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
          Enter the server-configured admin password to unlock portfolio editing, JSON export, and GitHub publishing controls.
        </p>

        {!configured && (
          <div
            role="status"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-200"
          >
            <ShieldAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
              aria-hidden="true"
            />
            <span>
              <strong className="font-semibold text-amber-100">
                Server Setup Required:
              </strong>{' '}
              <code className="font-mono">ADMIN_PASSWORD</code> is not set in your server environment variables. Configure it in your host Secrets panel (without{' '}
              <code className="font-mono">NEXT_PUBLIC_</code>) to enable sign-in.
            </span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="admin-password-input"
              className="block text-xs font-semibold text-slate-200"
            >
              Admin Password
            </label>
            <div className="relative mt-1.5">
              <KeyRound
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter server ADMIN_PASSWORD"
                className="block w-full rounded-lg border border-slate-700 bg-slate-950/90 py-2.5 pl-9 pr-10 font-mono text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-200"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
                aria-hidden="true"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Portfolio</span>
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-cyan-400 px-5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:opacity-60"
            >
              {submitting ? 'Verifying...' : 'Unlock Admin Panel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
