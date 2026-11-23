'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import { Maximize2, X } from 'lucide-react';
import type { ArchitectureNode } from '@/src/types/portfolio';

interface ArchitectureDiagramProps {
  nodes: ArchitectureNode[];
}

function DiagramSvg({
  selectedId,
  onSelect,
  shouldReduceMotion,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  shouldReduceMotion: boolean | null;
}) {
  const isHighlighted = (id: string) => selectedId === id;

  return (
    <svg
      viewBox="0 0 920 260"
      role="img"
      aria-label="MEAN Stack Kubernetes deployment architecture: GitHub Actions CI to Docker Image to Kind Kubernetes Cluster to Prometheus and Grafana"
      className="h-auto w-full select-none"
    >
      <defs>
        <linearGradient id="pipeFlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connector lines between the 4 stages */}
      <line
        x1="196"
        y1="126"
        x2="246"
        y2="126"
        stroke="#334155"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <line
        x1="422"
        y1="126"
        x2="472"
        y2="126"
        stroke="#334155"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <line
        x1="674"
        y1="126"
        x2="724"
        y2="126"
        stroke="#334155"
        strokeWidth="2"
        strokeDasharray="5 5"
      />

      {/* Animated data-flow pulses */}
      {!shouldReduceMotion && (
        <>
          <motion.circle
            r="4"
            cy="126"
            fill="#22d3ee"
            filter="url(#softGlow)"
            animate={{ cx: [198, 244], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            r="4"
            cy="126"
            fill="#34d399"
            filter="url(#softGlow)"
            animate={{ cx: [424, 470], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.45,
            }}
          />
          <motion.circle
            r="4"
            cy="126"
            fill="#22d3ee"
            filter="url(#softGlow)"
            animate={{ cx: [676, 722], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.9,
            }}
          />
        </>
      )}

      {/* Arrow heads */}
      <polygon points="246,126 238,121 238,131" fill="#22d3ee" />
      <polygon points="472,126 464,121 464,131" fill="#34d399" />
      <polygon points="724,126 716,121 716,131" fill="#22d3ee" />

      {/* Node 1: GitHub Actions CI */}
      <g
        role="button"
        tabIndex={0}
        onClick={() => onSelect('ci')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect('ci');
        }}
        className="cursor-pointer focus:outline-none"
      >
        <rect
          x="16"
          y="46"
          width="180"
          height="160"
          rx="12"
          fill="#0f172a"
          stroke={isHighlighted('ci') ? '#22d3ee' : '#1e293b'}
          strokeWidth={isHighlighted('ci') ? '2' : '1.5'}
        />
        <text
          x="32"
          y="74"
          fill="#22d3ee"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          01 · CI PIPELINE
        </text>
        <text
          x="32"
          y="102"
          fill="#f8fafc"
          fontSize="16"
          fontWeight="600"
          fontFamily="var(--font-plus-jakarta), sans-serif"
        >
          GitHub Actions
        </text>
        <rect
          x="32"
          y="122"
          width="148"
          height="28"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.65"
        />
        <text
          x="42"
          y="140"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          kind-action boot
        </text>
        <rect
          x="32"
          y="158"
          width="148"
          height="28"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.65"
        />
        <text
          x="42"
          y="176"
          fill="#34d399"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          HTTP smoke tests
        </text>
      </g>

      {/* Node 2: Docker Images */}
      <g
        role="button"
        tabIndex={0}
        onClick={() => onSelect('registry')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect('registry');
        }}
        className="cursor-pointer focus:outline-none"
      >
        <rect
          x="246"
          y="46"
          width="176"
          height="160"
          rx="12"
          fill="#0f172a"
          stroke={isHighlighted('registry') ? '#38bdf8' : '#1e293b'}
          strokeWidth={isHighlighted('registry') ? '2' : '1.5'}
        />
        <text
          x="262"
          y="74"
          fill="#38bdf8"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          02 · CONTAINERS
        </text>
        <text
          x="262"
          y="102"
          fill="#f8fafc"
          fontSize="16"
          fontWeight="600"
          fontFamily="var(--font-plus-jakarta), sans-serif"
        >
          Docker Image
        </text>
        <rect
          x="262"
          y="122"
          width="144"
          height="28"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.65"
        />
        <text
          x="272"
          y="140"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          angular-client
        </text>
        <rect
          x="262"
          y="158"
          width="144"
          height="28"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.65"
        />
        <text
          x="272"
          y="176"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          express-api
        </text>
      </g>

      {/* Node 3: Kind K8s Cluster */}
      <g
        role="button"
        tabIndex={0}
        onClick={() => onSelect('cluster')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect('cluster');
        }}
        className="cursor-pointer focus:outline-none"
      >
        <rect
          x="472"
          y="26"
          width="202"
          height="202"
          rx="14"
          fill="#0f172a"
          stroke={isHighlighted('cluster') ? '#34d399' : '#1e293b'}
          strokeWidth={isHighlighted('cluster') ? '2' : '1.5'}
        />
        <text
          x="488"
          y="54"
          fill="#34d399"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          03 · KIND K8S CLUSTER
        </text>
        <text
          x="488"
          y="80"
          fill="#f8fafc"
          fontSize="16"
          fontWeight="600"
          fontFamily="var(--font-plus-jakarta), sans-serif"
        >
          Kubernetes Pods
        </text>
        <rect
          x="488"
          y="98"
          width="170"
          height="32"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.75"
        />
        <text
          x="500"
          y="118"
          fill="#e2e8f0"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          Frontend (Angular)
        </text>
        <rect
          x="488"
          y="138"
          width="170"
          height="32"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.75"
        />
        <text
          x="500"
          y="158"
          fill="#e2e8f0"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          Backend (Express)
        </text>
        <rect
          x="488"
          y="178"
          width="170"
          height="32"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.75"
        />
        <text
          x="500"
          y="198"
          fill="#34d399"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          MongoDB Stateful
        </text>
      </g>

      {/* Node 4: Prometheus & Grafana */}
      <g
        role="button"
        tabIndex={0}
        onClick={() => onSelect('observability')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect('observability');
        }}
        className="cursor-pointer focus:outline-none"
      >
        <rect
          x="724"
          y="46"
          width="180"
          height="160"
          rx="12"
          fill="#0f172a"
          stroke={isHighlighted('observability') ? '#22d3ee' : '#1e293b'}
          strokeWidth={isHighlighted('observability') ? '2' : '1.5'}
        />
        <text
          x="740"
          y="74"
          fill="#22d3ee"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          04 · OBSERVABILITY
        </text>
        <text
          x="740"
          y="102"
          fill="#f8fafc"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-plus-jakarta), sans-serif"
        >
          Metrics Stack
        </text>
        <rect
          x="740"
          y="122"
          width="148"
          height="28"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.65"
        />
        <text
          x="750"
          y="140"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          Prometheus scrape
        </text>
        <rect
          x="740"
          y="158"
          width="148"
          height="28"
          rx="6"
          fill="#1e293b"
          fillOpacity="0.65"
        />
        <text
          x="750"
          y="176"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
        >
          Grafana dashboards
        </text>
      </g>
    </svg>
  );
}

export function ArchitectureDiagram({ nodes }: ArchitectureDiagramProps) {
  const shouldReduceMotion = useSafeReducedMotion();
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id ?? 'ci');
  const [zoomOpen, setZoomOpen] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? nodes[0];

  useEffect(() => {
    if (!zoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomOpen]);

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-950/80 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-medium text-cyan-300">
            Deployment Pipeline & Cluster Topology
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Select any stage to inspect its implementation details
          </p>
        </div>

        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Maximize2 className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
          <span>Zoom Diagram</span>
        </button>
      </div>

      {/* Interactive Diagram Canvas (Tap-to-zoom friendly on mobile) */}
      <div
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setZoomOpen(true);
          }
        }}
        className="overflow-x-auto rounded-lg border border-slate-800/70 bg-slate-950 p-2 sm:p-4"
      >
        <div className="min-w-[640px] md:min-w-0">
          <DiagramSvg
            selectedId={selectedNodeId}
            onSelect={setSelectedNodeId}
            shouldReduceMotion={shouldReduceMotion}
          />
        </div>
      </div>

      {/* Stage selector tabs + live detail callout */}
      {selectedNode && (
        <div className="mt-4 border-t border-slate-800/80 pt-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {nodes.map((node) => {
              const active = node.id === selectedNode.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {node.title}
                </button>
              );
            })}
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            <span className="font-mono text-xs text-emerald-400 mr-2">
              {selectedNode.stage}
            </span>
            {selectedNode.detail}
          </p>
        </div>
      )}

      {/* Tap-to-Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
            onClick={() => setZoomOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Zoomed Kubernetes Architecture Diagram"
              className="w-full max-w-5xl rounded-2xl border border-slate-700/80 bg-slate-900 p-4 sm:p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    MEAN Stack Kubernetes Architecture
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scroll horizontally on narrow screens or tap any stage node
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomOpen(false)}
                  aria-label="Close diagram zoom"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="min-w-[780px]">
                  <DiagramSvg
                    selectedId={selectedNodeId}
                    onSelect={setSelectedNodeId}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                </div>
              </div>

              {selectedNode && (
                <p className="mt-4 text-sm text-slate-300">
                  <span className="font-mono text-xs text-cyan-300 mr-2">
                    {selectedNode.title}:
                  </span>
                  {selectedNode.detail}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
