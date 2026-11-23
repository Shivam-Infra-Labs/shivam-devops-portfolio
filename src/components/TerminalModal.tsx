'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Terminal as TerminalIcon, X } from 'lucide-react';
import { usePortfolio } from '@/src/context/PortfolioContext';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  text: string;
  actionLabel?: string;
  actionHref?: string;
}

const QUICK_COMMANDS = [
  'help',
  'whoami',
  'projects',
  'labs',
  'incidents',
  'tools',
  'services',
  'contact',
  'admin',
  'clear',
];

export function TerminalModal() {
  const { data, isTerminalOpen, closeTerminal } = usePortfolio();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(0);
  const makeLineId = (prefix: string) => {
    nextIdRef.current += 1;
    return `${prefix}-${nextIdRef.current}`;
  };

  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'welcome-1',
      type: 'output',
      text: 'Shivam Infra CLI — Type "help" or tap a command below to inspect projects, labs, incidents, or navigate.',
    },
  ]);

  useEffect(() => {
    if (isTerminalOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    if (!isTerminalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTerminal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTerminalOpen, closeTerminal]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, isTerminalOpen]);

  const navigateAndClose = (href: string) => {
    closeTerminal();
    router.push(href);
  };

  const runCommand = (rawCommand: string) => {
    const cmd = rawCommand.trim().toLowerCase();
    if (!cmd) return;

    setCommandHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);

    if (cmd === 'clear') {
      setLines([]);
      setInputValue('');
      return;
    }

    const inputEntry: TerminalLine = {
      id: makeLineId('in'),
      type: 'input',
      text: `shivam@infra:~$ ${cmd}`,
    };

    const outputEntries: TerminalLine[] = [];

    switch (cmd) {
      case 'help':
        outputEntries.push({
          id: makeLineId('out-help'),
          type: 'output',
          text: [
            'Available commands:',
            '  whoami     — Identity, role, and availability status',
            '  projects   — Featured MEAN K8s deployment & engineering work',
            '  labs       — Hands-on CCNA & DevOps labs',
            '  incidents  — Open Interactive Incident Response Lab (/incidents)',
            '  tools      — Jump to Annotated Docker & Compose Explorer',
            '  services   — View freelance containerization offerings',
            '  contact    — Contact details & jump to inquiry form',
            '  resume     — Open ATS-friendly printable resume (/resume)',
            '  admin      — Open Website Admin Panel (/admin)',
            '  clear      — Clear terminal output',
          ].join('\n'),
        });
        break;

      case 'whoami':
        outputEntries.push({
          id: makeLineId('out-whoami'),
          type: 'output',
          text: `${data.profile.name} — ${data.profile.headline}\nLocation: ${data.profile.availabilityLine}\nEmail: ${data.profile.email}\nGitHub: ${data.profile.githubUrl}`,
        });
        break;

      case 'projects': {
        const visibleProjects = data.engineeringWork.filter(
          (p) => p.visible !== false
        );
        const list = visibleProjects
          .map((p) => `  • ${p.title} (${p.category}) -> ${p.primaryUrl}`)
          .join('\n');
        outputEntries.push({
          id: makeLineId('out-projects'),
          type: 'output',
          text: `Featured: ${data.featuredProject.title} (${data.featuredProject.repoUrl})\n\nEngineering Work:\n${list}`,
          actionLabel: 'Jump to Projects',
          actionHref: '/#projects',
        });
        break;
      }

      case 'labs':
        outputEntries.push({
          id: makeLineId('out-labs'),
          type: 'output',
          text: '1. Enterprise CCNA Network Lab (Multi-Area OSPF, VLANs, SVI)\n2. Interactive Incident Response Lab (Kind K8s, OSPF, Nginx 502)',
          actionLabel: 'Open Incident Lab',
          actionHref: '/incidents',
        });
        break;

      case 'incidents':
        outputEntries.push({
          id: makeLineId('out-incidents'),
          type: 'output',
          text: `Loaded ${
            data.incidentScenarios.filter((s) => s.visible !== false).length
          } interactive incident scenarios. Opening /incidents...`,
          actionLabel: 'Go to /incidents',
          actionHref: '/incidents',
        });
        break;

      case 'tools':
        outputEntries.push({
          id: makeLineId('out-tools'),
          type: 'output',
          text: `DevOps Productivity Hub (/tools): IPv4/OSPF Subnet Calculator, Visual chmod/docker/kubectl Builder, and Production Security Audit.\nGenerator defaults: ${data.generatorSettings.defaultBaseImage} · Port: ${data.generatorSettings.defaultPort}`,
          actionLabel: 'Open /tools Hub',
          actionHref: '/tools',
        });
        break;

      case 'services': {
        const visibleServices = data.services.filter((s) => s.visible !== false);
        outputEntries.push({
          id: makeLineId('out-services'),
          type: 'output',
          text: visibleServices
            .map((s) => `  ${s.number}. ${s.title} — ${s.deliverables.join(', ')}`)
            .join('\n'),
          actionLabel: 'View Services',
          actionHref: '/#services',
        });
        break;
      }

      case 'contact':
        outputEntries.push({
          id: makeLineId('out-contact'),
          type: 'output',
          text: `Email: ${
            data.contactSettings?.recipientEmail || data.profile.email
          }\nGitHub: ${data.profile.githubUrl}\nLinkedIn: ${
            data.profile.linkedinUrl
          }`,
          actionLabel: 'Open Contact Form',
          actionHref: '/#contact',
        });
        break;

      case 'resume':
        outputEntries.push({
          id: makeLineId('out-resume'),
          type: 'output',
          text: 'Opening printable ATS-friendly resume route...',
          actionLabel: 'Open /resume',
          actionHref: '/resume',
        });
        break;

      case 'admin':
        outputEntries.push({
          id: makeLineId('out-admin'),
          type: 'output',
          text: 'Opening Full-Access Website Admin Panel...',
          actionLabel: 'Open /admin',
          actionHref: '/admin',
        });
        break;

      default:
        outputEntries.push({
          id: makeLineId('out-err'),
          type: 'error',
          text: `Command not found: "${cmd}". Type "help" to list valid commands.`,
        });
        break;
    }

    setLines((prev) => [...prev, inputEntry, ...outputEntries]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = historyIndex + 1;
      if (nextIdx < commandHistory.length) {
        setHistoryIndex(nextIdx);
        setInputValue(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIndex - 1;
      if (nextIdx >= 0) {
        setHistoryIndex(nextIdx);
        setInputValue(commandHistory[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  return (
    <AnimatePresence>
      {isTerminalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md print:hidden"
          onClick={closeTerminal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Interactive Portfolio CLI Terminal"
            className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700/90 bg-slate-950 shadow-2xl"
          >
            {/* Terminal Titlebar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <TerminalIcon
                  className="h-4 w-4 text-cyan-400"
                  aria-hidden="true"
                />
                <span className="font-mono text-xs font-semibold text-slate-200">
                  shivam-infra-cli
                </span>
                <span className="hidden font-mono text-[11px] text-slate-500 sm:inline">
                  · Cmd/Ctrl + K
                </span>
              </div>
              <button
                type="button"
                onClick={closeTerminal}
                aria-label="Close terminal"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Clickable Quick Commands */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800/80 bg-slate-900/40 px-4 py-2.5">
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => runCommand(cmd)}
                  className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Output History */}
            <div
              ref={scrollRef}
              onClick={() => inputRef.current?.focus()}
              className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-3"
            >
              {lines.map((line) => (
                <div key={line.id}>
                  <pre
                    className={`whitespace-pre-wrap break-words ${
                      line.type === 'input'
                        ? 'text-cyan-300 font-semibold'
                        : line.type === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {line.text}
                  </pre>
                  {line.actionHref && line.actionLabel && (
                    <button
                      type="button"
                      onClick={() => navigateAndClose(line.actionHref!)}
                      className="mt-2 inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-slate-950"
                    >
                      <span>{line.actionLabel}</span>
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Command Prompt Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runCommand(inputValue);
              }}
              className="flex items-center gap-2 border-t border-slate-800 bg-slate-900/70 px-4 py-3 font-mono text-xs"
            >
              <span className="shrink-0 text-emerald-400">shivam@infra:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type help, incidents, projects, admin..."
                aria-label="Terminal command input"
                className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
