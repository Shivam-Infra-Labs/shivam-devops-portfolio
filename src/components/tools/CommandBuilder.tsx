'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, Terminal } from 'lucide-react';

type BuilderMode = 'chmod' | 'docker' | 'kubectl';
type KubectlAction = 'port-forward' | 'logs' | 'exec' | 'get' | 'describe';

interface PermSet {
  read: boolean;
  write: boolean;
  execute: boolean;
}

function permToOctal(p: PermSet): number {
  return (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0);
}

function permToSymbolic(p: PermSet): string {
  return `${p.read ? 'r' : '-'}${p.write ? 'w' : '-'}${p.execute ? 'x' : '-'}`;
}

export function CommandBuilder() {
  const [mode, setMode] = useState<BuilderMode>('chmod');
  const [copied, setCopied] = useState(false);

  // chmod state
  const [owner, setOwner] = useState<PermSet>({
    read: true,
    write: true,
    execute: true,
  });
  const [group, setGroup] = useState<PermSet>({
    read: true,
    write: false,
    execute: true,
  });
  const [other, setOther] = useState<PermSet>({
    read: false,
    write: false,
    execute: false,
  });
  const [chmodTarget, setChmodTarget] = useState('/var/www/app');
  const [chmodRecursive, setChmodRecursive] = useState(false);

  // docker run state
  const [dockerImage, setDockerImage] = useState('node:20-alpine');
  const [dockerName, setDockerName] = useState('web-api');
  const [dockerPortMap, setDockerPortMap] = useState('8080:3000');
  const [dockerRestart, setDockerRestart] = useState('unless-stopped');
  const [dockerDetached, setDockerDetached] = useState(true);
  const [dockerEnvFile, setDockerEnvFile] = useState('.env');
  const [dockerVolume, setDockerVolume] = useState('app-data:/data');
  const [dockerNetwork, setDockerNetwork] = useState('app-net');

  // kubectl state
  const [k8sAction, setK8sAction] = useState<KubectlAction>('port-forward');
  const [k8sNamespace, setK8sNamespace] = useState('monitoring');
  const [k8sResource, setK8sResource] = useState('svc/prometheus-server');
  const [k8sPorts, setK8sPorts] = useState('9090:9090');
  const [k8sTail, setK8sTail] = useState('100');
  const [k8sShell, setK8sShell] = useState('/bin/sh');

  const octalCode = `${permToOctal(owner)}${permToOctal(group)}${permToOctal(other)}`;
  const symbolicCode = `-${permToSymbolic(owner)}${permToSymbolic(group)}${permToSymbolic(other)}`;
  const hasWorldWriteWarning = other.write;

  const chmodCommand = `chmod ${chmodRecursive ? '-R ' : ''}${octalCode} ${
    chmodTarget.trim() || './target'
  }`;

  const buildDockerCommand = () => {
    const parts = ['docker run'];
    if (dockerDetached) parts.push('-d');
    if (dockerName.trim()) parts.push(`--name ${dockerName.trim()}`);
    if (dockerRestart !== 'no') parts.push(`--restart ${dockerRestart}`);
    if (dockerPortMap.trim()) parts.push(`-p ${dockerPortMap.trim()}`);
    if (dockerEnvFile.trim()) parts.push(`--env-file ${dockerEnvFile.trim()}`);
    if (dockerVolume.trim()) parts.push(`-v ${dockerVolume.trim()}`);
    if (dockerNetwork.trim()) parts.push(`--network ${dockerNetwork.trim()}`);
    parts.push(dockerImage.trim() || 'nginx:alpine');
    return parts.join(' \\\n  ');
  };

  const buildKubectlCommand = () => {
    const nsFlag = k8sNamespace.trim() ? ` -n ${k8sNamespace.trim()}` : '';
    const target = k8sResource.trim() || 'pod/app';
    switch (k8sAction) {
      case 'port-forward':
        return `kubectl port-forward${nsFlag} ${target} ${
          k8sPorts.trim() || '8080:80'
        }`;
      case 'logs':
        return `kubectl logs -f --tail=${k8sTail.trim() || '100'}${nsFlag} ${target}`;
      case 'exec':
        return `kubectl exec -it${nsFlag} ${target} -- ${k8sShell}`;
      case 'get':
        return `kubectl get pods,svc${nsFlag} -o wide`;
      case 'describe':
        return `kubectl describe${nsFlag} ${target}`;
    }
  };

  const activeCommand =
    mode === 'chmod'
      ? chmodCommand
      : mode === 'docker'
      ? buildDockerCommand()
      : buildKubectlCommand();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const applyOctalPreset = (o: number, g: number, ot: number) => {
    setOwner({
      read: (o & 4) !== 0,
      write: (o & 2) !== 0,
      execute: (o & 1) !== 0,
    });
    setGroup({
      read: (g & 4) !== 0,
      write: (g & 2) !== 0,
      execute: (g & 1) !== 0,
    });
    setOther({
      read: (ot & 4) !== 0,
      write: (ot & 2) !== 0,
      execute: (ot & 1) !== 0,
    });
  };

  return (
    <section
      id="commands"
      className="scroll-mt-24 rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Terminal className="h-4 w-4" aria-hidden="true" />
            <span>Tool 02 · CLI Builder</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Visual chmod, docker run & kubectl Builder
          </h2>
        </div>

        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1 self-start">
          {(
            [
              { id: 'chmod', label: 'chmod' },
              { id: 'docker', label: 'docker run' },
              { id: 'kubectl', label: 'kubectl' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setCopied(false);
              }}
              className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-medium whitespace-nowrap transition-colors ${
                mode === tab.id
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: chmod */}
      {mode === 'chmod' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyOctalPreset(7, 5, 0)}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 font-mono text-xs text-slate-200 hover:border-cyan-400/50"
              >
                750 (App Dir)
              </button>
              <button
                type="button"
                onClick={() => applyOctalPreset(6, 4, 0)}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 font-mono text-xs text-slate-200 hover:border-cyan-400/50"
              >
                640 (Config/.env)
              </button>
              <button
                type="button"
                onClick={() => applyOctalPreset(6, 0, 0)}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 font-mono text-xs text-slate-200 hover:border-cyan-400/50"
              >
                600 (SSH Key)
              </button>
              <button
                type="button"
                onClick={() => applyOctalPreset(7, 5, 5)}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 font-mono text-xs text-slate-200 hover:border-cyan-400/50"
              >
                755 (Public Script)
              </button>
            </div>

            <div className="font-mono text-sm text-cyan-300 tabular-nums">
              Octal: <strong>{octalCode}</strong> · {symbolicCode}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(
              [
                { title: 'Owner (u)', state: owner, setter: setOwner },
                { title: 'Group (g)', state: group, setter: setGroup },
                { title: 'Other (o)', state: other, setter: setOther },
              ] as const
            ).map((col) => (
              <div
                key={col.title}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-4"
              >
                <p className="mb-3 text-xs font-semibold text-white">
                  {col.title}
                </p>
                <div className="space-y-2.5 text-xs text-slate-300">
                  {(
                    [
                      { key: 'read', label: 'Read (4)' },
                      { key: 'write', label: 'Write (2)' },
                      { key: 'execute', label: 'Execute (1)' },
                    ] as const
                  ).map((perm) => (
                    <label
                      key={perm.key}
                      className="flex cursor-pointer items-center gap-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={col.state[perm.key]}
                        onChange={(e) =>
                          col.setter({
                            ...col.state,
                            [perm.key]: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="chmod-target"
                className="block text-xs font-semibold text-slate-200"
              >
                Target File or Directory
              </label>
              <input
                id="chmod-target"
                type="text"
                value={chmodTarget}
                onChange={(e) => setChmodTarget(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <label className="flex min-h-[42px] cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={chmodRecursive}
                  onChange={(e) => setChmodRecursive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400"
                />
                <span>Apply Recursively (-R)</span>
              </label>
            </div>
          </div>

          {hasWorldWriteWarning && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                aria-hidden="true"
              />
              <span>
                Security Warning: World-writable permissions (Other Write / e.g.{' '}
                <code className="font-mono">777</code>) allow any local system user or compromised service to overwrite files. Prefer{' '}
                <code className="font-mono">750</code> for directories or{' '}
                <code className="font-mono">640</code> for config files.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: docker run */}
      {mode === 'docker' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Image
            </label>
            <input
              type="text"
              value={dockerImage}
              onChange={(e) => setDockerImage(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Container Name (--name)
            </label>
            <input
              type="text"
              value={dockerName}
              onChange={(e) => setDockerName(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Port Mapping (-p)
            </label>
            <input
              type="text"
              value={dockerPortMap}
              onChange={(e) => setDockerPortMap(e.target.value)}
              placeholder="8080:3000"
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Restart Policy (--restart)
            </label>
            <select
              value={dockerRestart}
              onChange={(e) => setDockerRestart(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            >
              <option value="unless-stopped">unless-stopped</option>
              <option value="always">always</option>
              <option value="on-failure">on-failure</option>
              <option value="no">no</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Env File (--env-file)
            </label>
            <input
              type="text"
              value={dockerEnvFile}
              onChange={(e) => setDockerEnvFile(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Named Volume (-v)
            </label>
            <input
              type="text"
              value={dockerVolume}
              onChange={(e) => setDockerVolume(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Bridge Network (--network)
            </label>
            <input
              type="text"
              value={dockerNetwork}
              onChange={(e) => setDockerNetwork(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            />
          </div>
          <div className="flex items-end">
            <label className="flex min-h-[38px] cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs text-slate-200">
              <input
                type="checkbox"
                checked={dockerDetached}
                onChange={(e) => setDockerDetached(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400"
              />
              <span>Detached Mode (-d)</span>
            </label>
          </div>
        </div>
      )}

      {/* Mode 3: kubectl */}
      {mode === 'kubectl' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Debug Action
            </label>
            <select
              value={k8sAction}
              onChange={(e) => setK8sAction(e.target.value as KubectlAction)}
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            >
              <option value="port-forward">port-forward</option>
              <option value="logs">logs -f</option>
              <option value="exec">exec -it</option>
              <option value="get">get pods,svc -o wide</option>
              <option value="describe">describe</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Namespace (-n)
            </label>
            <input
              type="text"
              value={k8sNamespace}
              onChange={(e) => setK8sNamespace(e.target.value)}
              placeholder="default"
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
            />
          </div>
          {k8sAction !== 'get' && (
            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Resource / Pod / Service
              </label>
              <input
                type="text"
                value={k8sResource}
                onChange={(e) => setK8sResource(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
              />
            </div>
          )}
          {k8sAction === 'port-forward' && (
            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Local:Target Port
              </label>
              <input
                type="text"
                value={k8sPorts}
                onChange={(e) => setK8sPorts(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
              />
            </div>
          )}
          {k8sAction === 'logs' && (
            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Tail Lines (--tail)
              </label>
              <input
                type="number"
                value={k8sTail}
                onChange={(e) => setK8sTail(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
              />
            </div>
          )}
          {k8sAction === 'exec' && (
            <div>
              <label className="block text-xs font-semibold text-slate-200">
                Shell
              </label>
              <select
                value={k8sShell}
                onChange={(e) => setK8sShell(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2 font-mono text-xs text-white"
              >
                <option value="/bin/sh">/bin/sh</option>
                <option value="/bin/bash">/bin/bash</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Generated Command Box */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
          <span className="font-mono text-xs text-slate-400">
            Generated Command
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{copied ? 'Copied Command' : 'Copy Command'}</span>
          </button>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-cyan-300">
          {activeCommand}
        </pre>
      </div>
    </section>
  );
}
