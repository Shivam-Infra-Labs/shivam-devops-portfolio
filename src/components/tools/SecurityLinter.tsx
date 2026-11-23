'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileWarning,
  ShieldAlert,
} from 'lucide-react';

type LinterTarget = 'auto' | 'dockerfile' | 'kubernetes';
type Severity = 'HIGH' | 'MEDIUM' | 'PASS';

interface LintFinding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  remediation?: string;
}

const SAMPLE_INSECURE_DOCKERFILE = `FROM node:latest
WORKDIR /app
ENV DB_PASSWORD=supersecretpassword123
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]`;

const SAMPLE_INSECURE_K8S = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: api
          image: myorg/web-api:latest
          securityContext:
            privileged: true
          env:
            - name: JWT_SECRET
              value: "hardcoded-jwt-secret"
          ports:
            - containerPort: 3000`;

const SAMPLE_HARDENED_DOCKERFILE = `FROM node:20.18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20.18-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "server.js"]`;

function detectInputFormat(code: string, mode: LinterTarget): 'dockerfile' | 'kubernetes' {
  if (mode !== 'auto') return mode;
  const lower = code.toLowerCase();
  if (
    /^\s*(apiVersion|kind|spec|containers)\s*:/m.test(code) ||
    lower.includes('kind: deployment') ||
    lower.includes('kind: pod')
  ) {
    return 'kubernetes';
  }
  return 'dockerfile';
}

function lintDockerfile(code: string): LintFinding[] {
  const findings: LintFinding[] = [];
  const lines = code.split(/\r?\n/);

  // 1. Non-root USER check
  const userLines = lines
    .map((l) => l.trim())
    .filter((l) => /^USER\s+/i.test(l));
  const lastUser = userLines[userLines.length - 1];
  if (!lastUser || /^USER\s+(root|0)\b/i.test(lastUser)) {
    findings.push({
      id: 'df-non-root',
      severity: 'HIGH',
      title: 'Container runs as root (missing non-root USER)',
      detail:
        'Processes inside the container run with UID 0. If the application is compromised, attackers gain root privileges inside the container namespace.',
      remediation:
        'RUN addgroup -S appgroup && adduser -S appuser -G appgroup\nUSER appuser',
    });
  } else {
    findings.push({
      id: 'df-non-root-pass',
      severity: 'PASS',
      title: `Non-root execution configured (${lastUser})`,
      detail: 'Runtime stage drops root privileges before executing the entrypoint.',
    });
  }

  // 2. :latest or untagged FROM image
  const fromLines = lines
    .map((l) => l.trim())
    .filter((l) => /^FROM\s+/i.test(l));
  const hasLatestOrUntagged = fromLines.some((line) => {
    const imgPart = line.replace(/^FROM\s+/i, '').split(/\s+/)[0] || '';
    if (!imgPart || imgPart.toLowerCase() === 'scratch') return false;
    return imgPart.endsWith(':latest') || !imgPart.includes(':');
  });

  if (hasLatestOrUntagged) {
    findings.push({
      id: 'df-latest-tag',
      severity: 'MEDIUM',
      title: 'Base image uses :latest or an unpinned tag',
      detail:
        'Unpinned base images can pull breaking OS/runtime updates unexpectedly and weaken reproducible CI builds.',
      remediation: 'FROM node:20.18-alpine AS runner',
    });
  } else if (fromLines.length > 0) {
    findings.push({
      id: 'df-pinned-tag',
      severity: 'PASS',
      title: 'Base image tag is explicitly pinned',
      detail: 'Pinned image version improves build determinism.',
    });
  }

  // 3. Hardcoded secrets in ENV/ARG
  const secretEnvRegex =
    /^(ENV|ARG)\s+[A-Z0-9_]*(PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY)[A-Z0-9_]*\s*[=\s]\s*\S+/im;
  if (secretEnvRegex.test(code)) {
    findings.push({
      id: 'df-hardcoded-secret',
      severity: 'HIGH',
      title: 'Potential secret hardcoded in ENV or ARG instruction',
      detail:
        'Values in ENV/ARG are baked into image layers and visible via `docker history`. Never embed credentials at build time.',
      remediation:
        '# Remove secret from Dockerfile; inject at runtime via --env-file .env or Kubernetes Secret',
    });
  } else {
    findings.push({
      id: 'df-no-secret-pass',
      severity: 'PASS',
      title: 'No hardcoded secrets detected in ENV/ARG',
      detail: 'No obvious PASSWORD/SECRET/TOKEN literals found in build instructions.',
    });
  }

  // 4. Remote ADD or curl | sh
  if (/^ADD\s+https?:\/\//im.test(code) || /(curl|wget)[^\n]*\|\s*(sh|bash)/i.test(code)) {
    findings.push({
      id: 'df-remote-exec',
      severity: 'MEDIUM',
      title: 'Unverified remote download (ADD URL or pipe to shell)',
      detail:
        'Fetching remote scripts directly into `sh` or via `ADD http://` bypasses checksum verification.',
      remediation:
        '# Download with curl -fsSL, verify sha256sum before executing, or use COPY',
    });
  }

  // 5. Missing HEALTHCHECK
  if (!/^HEALTHCHECK\s+/im.test(code)) {
    findings.push({
      id: 'df-healthcheck',
      severity: 'MEDIUM',
      title: 'Missing HEALTHCHECK instruction',
      detail:
        'Docker Compose `depends_on: condition: service_healthy` cannot detect application readiness without a healthcheck.',
      remediation:
        'HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\\n  CMD wget -qO- http://127.0.0.1:3000/health || exit 1',
    });
  } else {
    findings.push({
      id: 'df-healthcheck-pass',
      severity: 'PASS',
      title: 'Container HEALTHCHECK defined',
      detail: 'Orchestrators can verify HTTP/process readiness.',
    });
  }

  // 6. Multi-stage check
  if (/\bFROM\s+\S+\s+AS\s+\S+/i.test(code)) {
    findings.push({
      id: 'df-multistage-pass',
      severity: 'PASS',
      title: 'Multi-stage build detected',
      detail: 'Separating builder and runner stages reduces final image size.',
    });
  }

  return findings;
}

function lintKubernetes(code: string): LintFinding[] {
  const findings: LintFinding[] = [];

  // 1. privileged: true
  if (/privileged:\s*true/i.test(code)) {
    findings.push({
      id: 'k8s-privileged',
      severity: 'HIGH',
      title: 'Privileged container enabled (privileged: true)',
      detail:
        'Privileged pods gain nearly full host kernel capabilities and can escape container isolation.',
      remediation:
        'securityContext:\n  privileged: false\n  allowPrivilegeEscalation: false',
    });
  }

  // 2. runAsNonRoot: true
  if (!/runAsNonRoot:\s*true/i.test(code) || /runAsUser:\s*0\b/i.test(code)) {
    findings.push({
      id: 'k8s-non-root',
      severity: 'HIGH',
      title: 'Missing securityContext.runAsNonRoot: true',
      detail:
        'Without runAsNonRoot: true, containers default to running as root unless overridden inside the image.',
      remediation:
        'securityContext:\n  runAsNonRoot: true\n  runAsUser: 10001\n  readOnlyRootFilesystem: true',
    });
  } else {
    findings.push({
      id: 'k8s-non-root-pass',
      severity: 'PASS',
      title: 'Pod enforces runAsNonRoot: true',
      detail: 'Kubelet rejects root container execution.',
    });
  }

  // 3. allowPrivilegeEscalation: false
  if (!/allowPrivilegeEscalation:\s*false/i.test(code)) {
    findings.push({
      id: 'k8s-priv-esc',
      severity: 'MEDIUM',
      title: 'Missing allowPrivilegeEscalation: false & capability drop',
      detail:
        'Allowing privilege escalation lets child processes gain extra Linux capabilities via setuid binaries.',
      remediation:
        'securityContext:\n  allowPrivilegeEscalation: false\n  capabilities:\n    drop: ["ALL"]',
    });
  } else {
    findings.push({
      id: 'k8s-priv-esc-pass',
      severity: 'PASS',
      title: 'allowPrivilegeEscalation disabled',
      detail: 'Prevents child processes from acquiring elevated privileges.',
    });
  }

  // 4. resources.limits
  if (!/resources:\s*[\s\S]*limits:/i.test(code)) {
    findings.push({
      id: 'k8s-limits',
      severity: 'MEDIUM',
      title: 'Missing resources.limits (CPU & Memory)',
      detail:
        'Unbounded pods can trigger OOMKills or starve co-located workloads on the node.',
      remediation:
        'resources:\n  requests:\n    cpu: "100m"\n    memory: "128Mi"\n  limits:\n    cpu: "500m"\n    memory: "512Mi"',
    });
  } else {
    findings.push({
      id: 'k8s-limits-pass',
      severity: 'PASS',
      title: 'CPU & memory resource limits defined',
      detail: 'Protects cluster nodes from noisy-neighbor exhaustion.',
    });
  }

  // 5. :latest image tag
  const imageMatches = Array.from(code.matchAll(/image:\s*["']?([^\s"']+)["']?/gi));
  const badImages = imageMatches.filter((m) => {
    const img = m[1] || '';
    return img.endsWith(':latest') || !img.includes(':');
  });
  if (badImages.length > 0) {
    findings.push({
      id: 'k8s-latest-tag',
      severity: 'MEDIUM',
      title: `Unpinned image tag (${badImages[0][1]})`,
      detail:
        'Deploying `:latest` breaks rollback determinism and can pull unverified images.',
      remediation: 'image: ghcr.io/your-org/web-api:v1.2.0',
    });
  } else if (imageMatches.length > 0) {
    findings.push({
      id: 'k8s-pinned-image',
      severity: 'PASS',
      title: 'Container image uses an explicit tag',
      detail: 'Supports predictable rollouts and rollbacks.',
    });
  }

  // 6. Hardcoded env secrets
  if (
    /name:\s*["']?[A-Z0-9_]*(PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY)[A-Z0-9_]*["']?\s*\n\s*value:\s*["']?[^${\s]/im.test(
      code
    )
  ) {
    findings.push({
      id: 'k8s-hardcoded-env',
      severity: 'HIGH',
      title: 'Hardcoded secret literal in Deployment env.value',
      detail:
        'Plaintext secrets committed in Deployment YAML expose credentials in Git history and cluster describe outputs.',
      remediation:
        'env:\n  - name: JWT_SECRET\n    valueFrom:\n      secretKeyRef:\n        name: app-secrets\n        key: jwt-secret',
    });
  } else {
    findings.push({
      id: 'k8s-env-pass',
      severity: 'PASS',
      title: 'No plaintext secret literals in env definitions',
      detail: 'Safe environment variable wiring detected.',
    });
  }

  // 7. Probes
  if (!/(readinessProbe|livenessProbe):/i.test(code)) {
    findings.push({
      id: 'k8s-probes',
      severity: 'MEDIUM',
      title: 'Missing readinessProbe / livenessProbe',
      detail:
        'Kubernetes may send Service traffic before the container finishes booting or fail to restart hung workers.',
      remediation:
        'readinessProbe:\n  httpGet:\n    path: /health\n    port: 3000\n  initialDelaySeconds: 5\n  periodSeconds: 10',
    });
  } else {
    findings.push({
      id: 'k8s-probes-pass',
      severity: 'PASS',
      title: 'Container health probes configured',
      detail: 'Supports zero-drop rolling updates and automatic recovery.',
    });
  }

  return findings;
}

export function SecurityLinter() {
  const [target, setTarget] = useState<LinterTarget>('auto');
  const [code, setCode] = useState(SAMPLE_INSECURE_DOCKERFILE);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const detectedFormat = useMemo(
    () => detectInputFormat(code, target),
    [code, target]
  );

  const findings = useMemo(() => {
    if (!code.trim()) return [];
    return detectedFormat === 'kubernetes'
      ? lintKubernetes(code)
      : lintDockerfile(code);
  }, [code, detectedFormat]);

  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const passCount = findings.filter((f) => f.severity === 'PASS').length;

  const handleCopySnippet = async (id: string, snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <section
      id="linter"
      className="scroll-mt-24 rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <FileWarning className="h-4 w-4" aria-hidden="true" />
            <span>Tool 04 · Static Security Rules</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Dockerfile & Kubernetes Security Linter
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Paste any Dockerfile or Kubernetes YAML to audit root execution, `:latest` tags, resource limits, privileged mode, and hardcoded secrets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1">
            {(
              [
                { id: 'auto', label: 'Auto-Detect' },
                { id: 'dockerfile', label: 'Dockerfile' },
                { id: 'kubernetes', label: 'K8s YAML' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTarget(opt.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  target === opt.id
                    ? 'bg-cyan-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setTarget('auto');
              setCode(SAMPLE_INSECURE_DOCKERFILE);
            }}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-[11px] text-slate-300 hover:border-rose-400/50 hover:text-white"
          >
            Sample: Insecure Dockerfile
          </button>
          <button
            type="button"
            onClick={() => {
              setTarget('auto');
              setCode(SAMPLE_INSECURE_K8S);
            }}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-[11px] text-slate-300 hover:border-rose-400/50 hover:text-white"
          >
            Sample: Insecure K8s Deployment
          </button>
          <button
            type="button"
            onClick={() => {
              setTarget('auto');
              setCode(SAMPLE_HARDENED_DOCKERFILE);
            }}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-[11px] text-emerald-300 hover:border-emerald-400/50 hover:text-emerald-200"
          >
            Sample: Hardened Dockerfile
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
          <span className="text-slate-400">
            Format: <strong className="text-cyan-300">{detectedFormat}</strong>
          </span>
          <span className="text-rose-400">{highCount} HIGH</span>
          <span className="text-amber-300">{mediumCount} MEDIUM</span>
          <span className="text-emerald-400">{passCount} PASS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Paste Editor */}
        <div className="lg:col-span-5">
          <label
            htmlFor="security-linter-input"
            className="block text-xs font-semibold text-slate-200"
          >
            Paste Dockerfile or Kubernetes YAML
          </label>
          <textarea
            id="security-linter-input"
            rows={15}
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste Dockerfile or K8s deployment.yaml..."
            className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950/90 p-4 font-mono text-xs leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          />
        </div>

        {/* Live Findings Output */}
        <div className="space-y-3 lg:col-span-7">
          {findings.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-8 text-center text-xs text-slate-400">
              Paste a Dockerfile or Kubernetes manifest on the left to inspect security rules.
            </div>
          ) : (
            findings.map((finding) => {
              const badgeStyle =
                finding.severity === 'HIGH'
                  ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                  : finding.severity === 'MEDIUM'
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
                  : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300';

              const cardBorder =
                finding.severity === 'HIGH'
                  ? 'border-rose-500/30 bg-rose-950/15'
                  : finding.severity === 'MEDIUM'
                  ? 'border-amber-500/25 bg-slate-950/85'
                  : 'border-emerald-500/25 bg-emerald-950/10';

              return (
                <div
                  key={finding.id}
                  className={`rounded-xl border p-4 ${cardBorder}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {finding.severity === 'HIGH' ? (
                        <ShieldAlert
                          className="h-4 w-4 shrink-0 text-rose-400"
                          aria-hidden="true"
                        />
                      ) : finding.severity === 'MEDIUM' ? (
                        <AlertTriangle
                          className="h-4 w-4 shrink-0 text-amber-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-emerald-400"
                          aria-hidden="true"
                        />
                      )}
                      <h3 className="text-xs font-bold text-white sm:text-sm">
                        {finding.title}
                      </h3>
                    </div>

                    <span
                      className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${badgeStyle}`}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {finding.detail}
                  </p>

                  {finding.remediation && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
                        <span className="font-mono text-[10px] text-slate-400">
                          Recommended Fix Snippet
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            void handleCopySnippet(finding.id, finding.remediation!)
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 hover:text-cyan-200"
                        >
                          {copiedId === finding.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>
                            {copiedId === finding.id ? 'Copied' : 'Copy Snippet'}
                          </span>
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
                        {finding.remediation}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
