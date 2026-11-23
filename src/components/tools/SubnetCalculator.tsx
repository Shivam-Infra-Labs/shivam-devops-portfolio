'use client';

import React, { useMemo, useState } from 'react';
import { Check, Copy, Network } from 'lucide-react';

interface SubnetResult {
  valid: boolean;
  error?: string;
  ip: string;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  usableHosts: number;
  subnetMask: string;
  wildcardMask: string;
  binaryIp: string;
  binaryMask: string;
  binaryNetwork: string;
  binaryWildcard: string;
}

function parseIpv4ToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const num = Number(part);
    if (num < 0 || num > 255) return null;
    result = ((result << 8) | num) >>> 0;
  }
  return result;
}

function intToIpv4(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

function intToBinaryOctets(num: number): string {
  return [
    ((num >>> 24) & 255).toString(2).padStart(8, '0'),
    ((num >>> 16) & 255).toString(2).padStart(8, '0'),
    ((num >>> 8) & 255).toString(2).padStart(8, '0'),
    (num & 255).toString(2).padStart(8, '0'),
  ].join('.');
}

function calculateSubnet(rawInput: string, fallbackCidr: number): SubnetResult {
  const trimmed = rawInput.trim();
  let ipPart = trimmed;
  let cidr = fallbackCidr;

  if (trimmed.includes('/')) {
    const [ipStr, cidrStr] = trimmed.split('/');
    ipPart = ipStr;
    if (!/^\d+$/.test(cidrStr)) {
      return {
        valid: false,
        error: 'Enter a valid CIDR prefix between /0 and /32.',
      } as SubnetResult;
    }
    cidr = Number(cidrStr);
  }

  if (cidr < 0 || cidr > 32) {
    return {
      valid: false,
      error: 'CIDR prefix must be between 0 and 32.',
    } as SubnetResult;
  }

  const ipInt = parseIpv4ToInt(ipPart);
  if (ipInt === null) {
    return {
      valid: false,
      error: 'Enter a valid IPv4 address (e.g. 192.168.10.0/26).',
    } as SubnetResult;
  }

  const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  let firstUsableInt = networkInt;
  let lastUsableInt = broadcastInt;
  let usableHosts = 0;

  if (cidr === 32) {
    firstUsableInt = networkInt;
    lastUsableInt = networkInt;
    usableHosts = 1;
  } else if (cidr === 31) {
    // RFC 3021 point-to-point link
    firstUsableInt = networkInt;
    lastUsableInt = broadcastInt;
    usableHosts = 2;
  } else {
    firstUsableInt = (networkInt + 1) >>> 0;
    lastUsableInt = (broadcastInt - 1) >>> 0;
    usableHosts = Math.max(0, Math.pow(2, 32 - cidr) - 2);
  }

  return {
    valid: true,
    ip: intToIpv4(ipInt),
    cidr,
    networkAddress: intToIpv4(networkInt),
    broadcastAddress: intToIpv4(broadcastInt),
    firstUsable: intToIpv4(firstUsableInt),
    lastUsable: intToIpv4(lastUsableInt),
    usableHosts,
    subnetMask: intToIpv4(maskInt),
    wildcardMask: intToIpv4(wildcardInt),
    binaryIp: intToBinaryOctets(ipInt),
    binaryMask: intToBinaryOctets(maskInt),
    binaryNetwork: intToBinaryOctets(networkInt),
    binaryWildcard: intToBinaryOctets(wildcardInt),
  };
}

const PRESETS = [
  { label: '/24 LAN', value: '192.168.10.0/24' },
  { label: '/26 Subnet', value: '192.168.10.0/26' },
  { label: '/28 DMZ', value: '10.10.20.16/28' },
  { label: '/30 P2P Link', value: '10.10.12.0/30' },
];

export function SubnetCalculator() {
  const [cidrInput, setCidrInput] = useState('192.168.10.0/26');
  const [ospfProcess, setOspfProcess] = useState('1');
  const [ospfArea, setOspfArea] = useState('0');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const parsedFallbackCidr = useMemo(() => {
    const parts = cidrInput.split('/');
    if (parts[1] && /^\d+$/.test(parts[1])) {
      return Number(parts[1]);
    }
    return 24;
  }, [cidrInput]);

  const result = useMemo(
    () => calculateSubnet(cidrInput, parsedFallbackCidr),
    [cidrInput, parsedFallbackCidr]
  );

  const ciscoCommand = result.valid
    ? `router ospf ${ospfProcess.trim() || '1'}\n network ${result.networkAddress} ${result.wildcardMask} area ${ospfArea.trim() || '0'}`
    : '';

  const handleCopyCisco = async () => {
    if (!ciscoCommand) return;
    try {
      await navigator.clipboard.writeText(ciscoCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <section
      id="subnet"
      className="scroll-mt-24 rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Network className="h-4 w-4" aria-hidden="true" />
            <span>Tool 01 · Layer-3 Networking</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            IPv4 Subnet / CIDR & Cisco OSPF Wildcard Calculator
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setCidrInput(preset.value)}
              className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                cidrInput.trim() === preset.value
                  ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                  : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="sm:col-span-6">
          <label
            htmlFor="subnet-cidr-input"
            className="block text-xs font-semibold text-slate-200"
          >
            IPv4 Address & CIDR Prefix
          </label>
          <input
            id="subnet-cidr-input"
            type="text"
            value={cidrInput}
            onChange={(e) => setCidrInput(e.target.value)}
            placeholder="192.168.10.0/26"
            className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2.5 font-mono text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="ospf-process"
            className="block text-xs font-semibold text-slate-200"
          >
            OSPF Process ID
          </label>
          <input
            id="ospf-process"
            type="text"
            value={ospfProcess}
            onChange={(e) => setOspfProcess(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2.5 font-mono text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="ospf-area"
            className="block text-xs font-semibold text-slate-200"
          >
            OSPF Area
          </label>
          <input
            id="ospf-area"
            type="text"
            value={ospfArea}
            onChange={(e) => setOspfArea(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2.5 font-mono text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          />
        </div>
      </div>

      {!result.valid ? (
        <p role="alert" className="mt-4 text-xs font-medium text-rose-400">
          {result.error}
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Primary Subnet Readout Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[11px] font-medium text-slate-400">
                Network Address
              </p>
              <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                {result.networkAddress}/{result.cidr}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[11px] font-medium text-slate-400">
                Broadcast Address
              </p>
              <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                {result.broadcastAddress}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[11px] font-medium text-slate-400">
                Usable Host Range
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-emerald-300 tabular-nums">
                {result.firstUsable} – {result.lastUsable}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[11px] font-medium text-slate-400">
                Total Usable Hosts
              </p>
              <p className="mt-1 font-mono text-base font-semibold text-cyan-300 tabular-nums">
                {result.usableHosts.toLocaleString('en-US')}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 sm:col-span-2">
              <p className="text-[11px] font-medium text-slate-400">
                Subnet Mask
              </p>
              <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                {result.subnetMask}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 sm:col-span-2">
              <p className="text-[11px] font-medium text-cyan-200">
                Cisco OSPF Wildcard Mask
              </p>
              <p className="mt-1 font-mono text-base font-bold text-cyan-300 tabular-nums">
                {result.wildcardMask}
              </p>
            </div>
          </div>

          {/* Cisco IOS OSPF Command Output */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <span className="font-mono text-xs text-slate-300">
                Cisco IOS OSPF Network Statement
              </span>
              <button
                type="button"
                onClick={handleCopyCisco}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
              >
                {copiedCmd ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{copiedCmd ? 'Copied IOS Snippet' : 'Copy OSPF Command'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-emerald-300">
              {ciscoCommand}
            </pre>
          </div>

          {/* Binary Breakdown */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="mb-3 text-xs font-semibold text-slate-300">
              32-Bit Binary Breakdown
            </p>
            <div className="min-w-[520px] space-y-2 font-mono text-xs tabular-nums">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Input IPv4 ({result.ip})</span>
                <span className="text-slate-200">{result.binaryIp}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Subnet Mask ({result.subnetMask})</span>
                <span className="text-cyan-300">{result.binaryMask}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Network ({result.networkAddress})</span>
                <span className="text-emerald-300">{result.binaryNetwork}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Wildcard ({result.wildcardMask})</span>
                <span className="text-amber-300">{result.binaryWildcard}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
