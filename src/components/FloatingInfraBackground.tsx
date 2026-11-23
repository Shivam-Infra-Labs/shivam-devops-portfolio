'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useSafeReducedMotion } from '@/src/hooks/useSafeReducedMotion';
import {
  Activity,
  Boxes,
  Container,
  GitBranch,
  Network,
  Server,
  Terminal,
} from 'lucide-react';

interface FloatingBadge {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  positionClass: string;
  accentClass: string;
  hideOnMobile?: boolean;
  floatY: number;
  duration: number;
  delay: number;
}

const FLOATING_BADGES: FloatingBadge[] = [
  {
    id: 'docker',
    label: 'Docker',
    Icon: Container,
    positionClass: 'top-20 left-[6%] lg:left-[10%]',
    accentClass: 'text-cyan-300/80 border-cyan-500/20 shadow-cyan-500/10',
    floatY: 12,
    duration: 7.5,
    delay: 0,
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    Icon: Boxes,
    positionClass: 'top-24 right-[6%] lg:right-[11%]',
    accentClass: 'text-emerald-300/80 border-emerald-500/20 shadow-emerald-500/10',
    floatY: 14,
    duration: 8.5,
    delay: 0.6,
  },
  {
    id: 'linux',
    label: 'Linux',
    Icon: Terminal,
    positionClass: 'top-[48%] left-[3%] lg:left-[6%]',
    accentClass: 'text-slate-300/80 border-slate-700/60 shadow-cyan-500/5',
    hideOnMobile: true,
    floatY: 10,
    duration: 9,
    delay: 1.1,
  },
  {
    id: 'github-actions',
    label: 'GitHub Actions',
    Icon: GitBranch,
    positionClass: 'top-[46%] right-[3%] lg:right-[7%]',
    accentClass: 'text-cyan-300/80 border-cyan-500/20 shadow-cyan-500/10',
    hideOnMobile: true,
    floatY: 13,
    duration: 8,
    delay: 0.4,
  },
  {
    id: 'nginx',
    label: 'Nginx',
    Icon: Server,
    positionClass: 'bottom-20 left-[9%] lg:left-[15%]',
    accentClass: 'text-emerald-300/80 border-emerald-500/20 shadow-emerald-500/10',
    floatY: 11,
    duration: 7.8,
    delay: 0.8,
  },
  {
    id: 'prometheus',
    label: 'Prometheus',
    Icon: Activity,
    positionClass: 'bottom-16 right-[10%] lg:right-[16%]',
    accentClass: 'text-cyan-300/80 border-cyan-500/20 shadow-cyan-500/10',
    floatY: 12,
    duration: 8.2,
    delay: 1.4,
  },
  {
    id: 'cisco',
    label: 'Cisco OSPF',
    Icon: Network,
    positionClass: 'bottom-[34%] left-[16%]',
    accentClass: 'text-emerald-300/80 border-emerald-500/20 shadow-emerald-500/10',
    hideOnMobile: true,
    floatY: 9,
    duration: 9.5,
    delay: 0.3,
  },
];

export function FloatingInfraBackground() {
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Subtle radial ambient illumination */}
      <div className="absolute -top-32 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute top-1/3 right-[-120px] h-[360px] w-[480px] rounded-full bg-emerald-500/10 blur-[130px]" />

      {/* Subtle architectural grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(148 163 184) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Floating glass DevOps badges */}
      {FLOATING_BADGES.map((badge) => {
        const { Icon } = badge;
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.2 }
                : {
                    opacity: 0.2,
                    y: [-badge.floatY, badge.floatY, -badge.floatY],
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.4 }
                : {
                    opacity: { duration: 0.8, delay: badge.delay * 0.2 },
                    y: {
                      duration: badge.duration,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: badge.delay,
                    },
                  }
            }
            className={`${badge.positionClass} ${
              badge.hideOnMobile ? 'hidden md:flex' : 'flex'
            } ${badge.accentClass} absolute items-center gap-2 rounded-2xl border bg-slate-900/50 px-3.5 py-2.5 backdrop-blur-md shadow-lg`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="font-mono text-xs tracking-tight text-slate-200 whitespace-nowrap">
              {badge.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
