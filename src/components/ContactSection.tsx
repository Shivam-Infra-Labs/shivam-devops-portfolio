'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  Send,
  X,
} from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'fallback' | 'error';

export function ContactSection() {
  const { data, contactDraft, setContactDraft, clearContactPrefill } =
    usePortfolio();
  const { profile, contactSettings } = data;
  const shouldReduceMotion = useSafeReducedMotion();

  const recipientEmail = contactSettings?.recipientEmail || profile.email;
  const visibleSocialLinks = (profile.socialLinks ?? []).filter(
    (l) => l.visible !== false && l.platform !== 'email'
  );

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const buildMailtoHref = (
    senderEmail: string,
    stackValue: string,
    helpValue: string
  ) => {
    const subject = encodeURIComponent(
      `DevOps Inquiry${stackValue ? `: ${stackValue}` : ''}`
    );
    const body = encodeURIComponent(
      `Reply-To: ${senderEmail || 'Not provided'}\nApp Stack: ${
        stackValue || 'Not specified'
      }\n\nRequired Help:\n${helpValue || ''}`
    );
    return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(recipientEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const trimmedStack = contactDraft.appStack.trim();
    const trimmedHelp = contactDraft.requiredHelp.trim();

    if (!trimmedEmail || !trimmedStack || !trimmedHelp) {
      setStatus('error');
      setErrorMessage('Please fill in your Email, App Stack, and Required Help.');
      return;
    }

    const web3FormsKey =
      contactSettings?.web3FormsKey?.trim() ||
      process.env.NEXT_PUBLIC_WEB3FORMS_KEY?.trim();

    if (!web3FormsKey) {
      setStatus('fallback');
      window.location.href = buildMailtoHref(
        trimmedEmail,
        trimmedStack,
        trimmedHelp
      );
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: web3FormsKey,
          subject: `Portfolio Inquiry — ${trimmedStack}`,
          from_name: trimmedEmail,
          email: trimmedEmail,
          message: `App Stack: ${trimmedStack}\n\nRequired Help:\n${trimmedHelp}`,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (response.ok && result.success) {
        setStatus('success');
        setEmail('');
        clearContactPrefill();
      } else {
        setStatus('fallback');
        setErrorMessage(
          result.message ||
            'Web3Forms could not deliver automatically—use the direct email fallback below.'
        );
      }
    } catch {
      setStatus('fallback');
      setErrorMessage(
        'Network error reaching form endpoint—use the direct email fallback below.'
      );
    }
  };

  return (
    <section
      id="contact"
      className="scroll-mt-20 bg-slate-950 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 gap-10 lg:grid-cols-12"
        >
          {/* Left Column: Direct Details */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-wide text-cyan-400">
              Get in Touch
            </p>
            <h2 className="mt-1.5 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Start a DevOps Role Conversation or Freelance Scope
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Share your current application stack and what you need configured.{' '}
              {contactSettings?.responseNote ||
                'I respond directly by email with clear next steps.'}
            </p>

            <div className="mt-8 space-y-4 border-t border-slate-800/80 pt-6">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                  <a
                    href={`mailto:${recipientEmail}`}
                    className="truncate font-mono text-xs text-slate-200 hover:text-cyan-300"
                  >
                    {recipientEmail}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white"
                >
                  <Copy className="h-3 w-3" aria-hidden="true" />
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {visibleSocialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3-Field Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8">
              {contactDraft.serviceTitle && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2.5 text-xs text-cyan-200">
                  <span>
                    Pre-filled from{' '}
                    <strong className="font-semibold text-white">
                      {contactDraft.serviceTitle}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearContactPrefill();
                      setStatus('idle');
                    }}
                    aria-label="Clear pre-filled service details"
                    className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-stack"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    App Stack
                  </label>
                  <input
                    id="contact-stack"
                    name="appStack"
                    type="text"
                    required
                    value={contactDraft.appStack}
                    onChange={(e) =>
                      setContactDraft((prev) => ({
                        ...prev,
                        appStack: e.target.value,
                      }))
                    }
                    placeholder="e.g. Next.js + Node API + MongoDB, or PHP + MySQL"
                    className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-help"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Required Help
                  </label>
                  <textarea
                    id="contact-help"
                    name="requiredHelp"
                    rows={4}
                    required
                    value={contactDraft.requiredHelp}
                    onChange={(e) =>
                      setContactDraft((prev) => ({
                        ...prev,
                        requiredHelp: e.target.value,
                      }))
                    }
                    placeholder="Describe what you want containerized, networked, or automated..."
                    className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                {status === 'error' && errorMessage && (
                  <p role="alert" className="text-xs font-medium text-rose-400">
                    {errorMessage}
                  </p>
                )}

                {status === 'success' && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                      aria-hidden="true"
                    />
                    <span>
                      Inquiry sent successfully. Thank you — I will reply to your email shortly.
                    </span>
                  </div>
                )}

                {status === 'fallback' && (
                  <div
                    role="status"
                    className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-xs text-slate-200"
                  >
                    <p>
                      {errorMessage ||
                        'Your email client has been prompted with your pre-filled inquiry.'}
                    </p>
                    <a
                      href={buildMailtoHref(
                        email.trim(),
                        contactDraft.appStack.trim(),
                        contactDraft.requiredHelp.trim()
                      )}
                      className="mt-2 inline-flex items-center gap-1.5 font-semibold text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Open email draft to {recipientEmail}</span>
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <a
                    href={buildMailtoHref(
                      email.trim(),
                      contactDraft.appStack.trim(),
                      contactDraft.requiredHelp.trim()
                    )}
                    className="text-xs text-slate-400 underline decoration-slate-700 underline-offset-4 transition-colors hover:text-cyan-300"
                  >
                    Prefer direct email? {recipientEmail}
                  </a>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 whitespace-nowrap transition-all duration-150 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {status === 'submitting' ? 'Sending...' : 'Send Inquiry'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
