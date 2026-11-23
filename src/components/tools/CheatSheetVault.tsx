'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, Check, Copy, RotateCcw, Search, X } from 'lucide-react';

type VaultCategory =
  | 'All'
  | 'Docker'
  | 'Kubernetes'
  | 'Linux / Systemd'
  | 'Cisco IOS';

interface CommandEntry {
  id: string;
  category: Exclude<VaultCategory, 'All'>;
  subcategory: string;
  title: string;
  command: string;
  description: string;
  tags: string[];
  caution?: string;
}

const VAULT_COMMANDS: CommandEntry[] = [
  // Docker
  {
    id: 'docker-compose-up',
    category: 'Docker',
    subcategory: 'Compose Lifecycle',
    title: 'Rebuild and start Compose services detached',
    command: 'docker compose up -d --build --remove-orphans',
    description:
      'Rebuilds changed images, starts containers in the background, and cleans up stale services removed from compose.yaml.',
    tags: ['compose', 'build', 'deploy'],
  },
  {
    id: 'docker-compose-logs',
    category: 'Docker',
    subcategory: 'Debugging',
    title: 'Follow recent logs for a specific service',
    command: 'docker compose logs -f --tail=100 api',
    description:
      'Streams the last 100 lines and live stdout/stderr output from the api service container.',
    tags: ['logs', 'debugging', 'compose'],
  },
  {
    id: 'docker-inspect-user',
    category: 'Docker',
    subcategory: 'Security',
    title: 'Verify container runs as non-root user',
    command:
      "docker inspect --format='{{.Name}} -> user={{.Config.User}}' $(docker ps -q)",
    description:
      'Audits all running containers to verify explicit non-root UID/user configuration.',
    tags: ['security', 'non-root', 'audit'],
  },
  {
    id: 'docker-exec-shell',
    category: 'Docker',
    subcategory: 'Debugging',
    title: 'Open interactive shell in Alpine container',
    command: 'docker exec -it <container_name> sh',
    description:
      'Attaches an interactive Bourne shell inside a running container to inspect mounted volumes, env vars, or local ports.',
    tags: ['exec', 'debugging', 'alpine'],
  },
  {
    id: 'docker-network-inspect',
    category: 'Docker',
    subcategory: 'Networking',
    title: 'Inspect bridge network IPAM & connected containers',
    command: 'docker network inspect <network_name>',
    description:
      'Shows subnet allocation, gateway IP, and container DNS aliases inside a custom Docker bridge network.',
    tags: ['networking', 'dns', 'bridge'],
  },
  {
    id: 'docker-stats-disk',
    category: 'Docker',
    subcategory: 'Resource Telemetry',
    title: 'Snapshot container CPU, memory & disk usage',
    command: 'docker stats --no-stream && docker system df',
    description:
      'Prints a point-in-time CPU/RAM snapshot alongside image, container, and build cache disk consumption.',
    tags: ['monitoring', 'resources', 'telemetry'],
  },
  {
    id: 'docker-prune-safe',
    category: 'Docker',
    subcategory: 'Maintenance',
    title: 'Remove dangling unused images safely',
    command: 'docker image prune -f && docker builder prune --filter "until=168h"',
    description:
      'Frees host storage by removing untagged images and build cache layers older than 7 days without touching active volumes.',
    tags: ['cleanup', 'disk', 'maintenance'],
    caution: 'Avoid --volumes in production unless verified backups exist.',
  },

  // Kubernetes
  {
    id: 'k8s-pods-wide',
    category: 'Kubernetes',
    subcategory: 'Cluster State',
    title: 'List all pods with node placement and pod IPs',
    command: 'kubectl get pods -A -o wide',
    description:
      'Displays pod phase, restart counts, assigned node, and internal cluster IP across every namespace.',
    tags: ['pods', 'debugging', 'status'],
  },
  {
    id: 'k8s-describe-pod',
    category: 'Kubernetes',
    subcategory: 'Troubleshooting',
    title: 'Inspect scheduling events & CrashLoopBackOff reasons',
    command: 'kubectl describe pod <pod-name> -n <namespace>',
    description:
      'Surfaces image pull errors, readiness probe failures, OOMKilled exit codes, and volume mount issues in Events.',
    tags: ['events', 'debugging', 'crashloop'],
  },
  {
    id: 'k8s-logs-previous',
    category: 'Kubernetes',
    subcategory: 'Troubleshooting',
    title: 'Read logs from crashed previous container instance',
    command: 'kubectl logs <pod-name> -n <namespace> --previous --tail=150',
    description:
      'Retrieves stderr stack traces from the terminated container right before Kubernetes restarted it.',
    tags: ['logs', 'crashloop', 'debugging'],
  },
  {
    id: 'k8s-rollout-status',
    category: 'Kubernetes',
    subcategory: 'Deployments',
    title: 'Watch rollout progress or rollback a bad release',
    command:
      'kubectl rollout status deployment/<name> --timeout=90s\n# Rollback if unhealthy:\nkubectl rollout undo deployment/<name>',
    description:
      'Blocks CI scripts until new ReplicaSet pods pass readiness probes, with instant rollback to the prior revision.',
    tags: ['rollout', 'ci', 'deploy'],
  },
  {
    id: 'k8s-port-forward',
    category: 'Kubernetes',
    subcategory: 'Networking',
    title: 'Forward ClusterIP service port to localhost',
    command: 'kubectl port-forward svc/<service-name> 8080:80 -n <namespace>',
    description:
      'Tunnels an internal Kubernetes Service to localhost:8080 for smoke testing without exposing a public Ingress.',
    tags: ['networking', 'smoke-test', 'service'],
  },
  {
    id: 'k8s-kind-load',
    category: 'Kubernetes',
    subcategory: 'Local Kind Cluster',
    title: 'Load locally built Docker image into Kind node',
    command: 'kind load docker-image <image:tag> --name <cluster-name>',
    description:
      'Injects a local container image directly into Kind control-plane/worker nodes without pushing to an external registry.',
    tags: ['kind', 'ci', 'local'],
  },
  {
    id: 'k8s-netshoot-debug',
    category: 'Kubernetes',
    subcategory: 'Networking',
    title: 'Spawn ephemeral network debug pod in cluster',
    command:
      'kubectl run netshoot --rm -it --image=nicolaka/netshoot -- /bin/bash',
    description:
      'Starts a temporary pod with dig, curl, tcpdump, and traceroute to verify CoreDNS resolution and service endpoints.',
    tags: ['dns', 'networking', 'debugging'],
  },

  // Linux / Systemd
  {
    id: 'linux-systemd-logs',
    category: 'Linux / Systemd',
    subcategory: 'Services & Logs',
    title: 'Inspect systemd unit health and live journal logs',
    command: 'systemctl status nginx --no-pager && journalctl -u nginx -n 100 -f',
    description:
      'Checks active PID/memory state and tails structured systemd logs for Nginx or custom application services.',
    tags: ['systemd', 'logs', 'nginx'],
  },
  {
    id: 'linux-ss-ports',
    category: 'Linux / Systemd',
    subcategory: 'Networking',
    title: 'List listening TCP/UDP ports with owning processes',
    command: 'sudo ss -tulpn',
    description:
      'Verifies which daemon binds 0.0.0.0 vs 127.0.0.1 and catches port conflicts before starting containers or proxies.',
    tags: ['ports', 'networking', 'debugging'],
  },
  {
    id: 'linux-disk-triage',
    category: 'Linux / Systemd',
    subcategory: 'Storage',
    title: 'Find filesystem usage and largest directories',
    command: 'df -hT && du -sh /* 2>/dev/null | sort -h',
    description:
      'Identifies full partitions or runaway log directories causing database writes or container pulls to fail.',
    tags: ['disk', 'storage', 'debugging'],
  },
  {
    id: 'linux-nginx-reload',
    category: 'Linux / Systemd',
    subcategory: 'Reverse Proxy',
    title: 'Validate Nginx syntax before reloading config',
    command: 'sudo nginx -t && sudo systemctl reload nginx',
    description:
      'Tests reverse proxy server blocks and TLS paths first so invalid syntax never drops live traffic.',
    tags: ['nginx', 'ssl', 'zero-downtime'],
  },
  {
    id: 'linux-ufw-hardening',
    category: 'Linux / Systemd',
    subcategory: 'Firewall & Security',
    title: 'Review and enforce UFW host firewall rules',
    command:
      'sudo ufw status numbered\nsudo ufw allow 22/tcp && sudo ufw allow 80,443/tcp && sudo ufw enable',
    description:
      'Restricts inbound VPS traffic strictly to SSH, HTTP, and HTTPS while blocking direct database port exposure.',
    tags: ['security', 'firewall', 'ufw'],
    caution: 'Always allow SSH (port 22 or custom port) before enabling UFW.',
  },
  {
    id: 'linux-permissions-least-priv',
    category: 'Linux / Systemd',
    subcategory: 'Permissions',
    title: 'Apply least-privilege permissions on .env & scripts',
    command: 'chmod 600 .env && chmod 750 ./deploy.sh',
    description:
      'Restricts secret files to owner read/write only and limits executable scripts to owner + group.',
    tags: ['security', 'permissions', 'chmod'],
  },

  // Cisco IOS (OSPF / VLANs)
  {
    id: 'cisco-ospf-verify',
    category: 'Cisco IOS',
    subcategory: 'OSPF Verification',
    title: 'Verify OSPF neighbor adjacencies and learned routes',
    command: 'show ip ospf neighbor\nshow ip route ospf',
    description:
      'Confirms neighbor states reached FULL adjacency and verifies dynamically installed OSPF prefixes in the RIB.',
    tags: ['ospf', 'routing', 'verification'],
  },
  {
    id: 'cisco-ospf-config',
    category: 'Cisco IOS',
    subcategory: 'Multi-Area OSPF',
    title: 'Configure OSPF process, wildcard network & passive LAN',
    command:
      'configure terminal\n router ospf 1\n  router-id 1.1.1.1\n  network 192.168.10.0 0.0.0.63 area 0\n  passive-interface GigabitEthernet0/1\n end',
    description:
      'Advertises subnet with exact wildcard mask while suppressing unnecessary OSPF hello packets toward host access LANs.',
    tags: ['ospf', 'wildcard', 'routing'],
  },
  {
    id: 'cisco-vlan-trunk-verify',
    category: 'Cisco IOS',
    subcategory: 'VLAN & Trunking',
    title: 'Inspect VLAN table and 802.1Q trunk allowed VLANs',
    command: 'show vlan brief\nshow interfaces trunk',
    description:
      'Audits port-to-VLAN assignments, native VLAN consistency, and active 802.1Q trunking links across switches.',
    tags: ['vlans', 'trunking', 'verification'],
  },
  {
    id: 'cisco-access-trunk-config',
    category: 'Cisco IOS',
    subcategory: 'Switch Ports',
    title: 'Assign access VLAN and configure 802.1Q trunk port',
    command:
      'configure terminal\n vlan 20\n  name APP_TIER\n interface FastEthernet0/1\n  switchport mode access\n  switchport access vlan 20\n interface GigabitEthernet0/1\n  switchport trunk encapsulation dot1q\n  switchport mode trunk\n  switchport trunk allowed vlan 10,20,99',
    description:
      'Isolates host ports into named VLANs and restricts trunk uplinks strictly to required operational VLAN IDs.',
    tags: ['vlans', 'switchport', 'security'],
  },
  {
    id: 'cisco-svi-routing',
    category: 'Cisco IOS',
    subcategory: 'Layer-3 SVI',
    title: 'Enable IP routing and configure Layer-3 SVI gateway',
    command:
      'configure terminal\n ip routing\n interface vlan 20\n  ip address 192.168.20.1 255.255.255.0\n  no shutdown\n ip route 0.0.0.0 0.0.0.0 203.0.113.1',
    description:
      'Configures inter-VLAN Layer-3 Switch Virtual Interface gateway and default static route toward ISP edge.',
    tags: ['svi', 'routing', 'vlans'],
  },
];

const CATEGORIES: VaultCategory[] = [
  'All',
  'Docker',
  'Kubernetes',
  'Linux / Systemd',
  'Cisco IOS',
];

const QUICK_TAGS = [
  'debugging',
  'networking',
  'security',
  'logs',
  'ospf',
  'vlans',
  'compose',
  'rollout',
];

export function CheatSheetVault() {
  const [selectedCategory, setSelectedCategory] = useState<VaultCategory>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return VAULT_COMMANDS.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }
      if (!normalizedQuery) return true;

      const haystack = [
        item.category,
        item.subcategory,
        item.title,
        item.command,
        item.description,
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, selectedCategory, selectedTag]);

  const handleCopy = async (id: string, cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedTag(null);
    setQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' || selectedTag !== null || query.trim() !== '';

  return (
    <section
      id="vault"
      className="scroll-mt-24 rounded-2xl border border-slate-800/90 bg-slate-900/55 p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Tool 04 · CLI Command Vault</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Searchable DevOps & Cisco CLI Cheat-Sheet Vault
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Instant lookup for production Docker, Kubernetes, Linux/Systemd, and Cisco IOS (OSPF/VLAN) commands.
          </p>
        </div>

        <p className="font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
          Showing {filteredCommands.length} of {VAULT_COMMANDS.length} commands
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search DevOps and Cisco CLI commands"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, flags, ospf, crashloop, ss..."
              className="block w-full rounded-lg border border-slate-700 bg-slate-950/90 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Interactive Category Filter Buttons */}
          <div
            role="tablist"
            aria-label="Filter command category"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 p-1"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Tag Filters + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-400">
              Filter by topic:
            </span>
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setSelectedTag((prev) => (prev === tag ? null : tag))
                  }
                  className={`rounded-md border px-2.5 py-1 font-mono text-[11px] whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {filteredCommands.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-white">
            No matching commands found
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Try clearing your search filter or switching to All categories.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Show All Commands</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredCommands.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-5 transition-colors hover:border-slate-700"
              >
                <div>
                  {/* Quiet Unboxed Metadata Line (Zero-Pill Discipline) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span>
                      <span className="font-semibold text-cyan-300">
                        {item.category}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>{item.subcategory}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {item.tags.join(' · ')}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="overflow-hidden rounded-lg border border-slate-800/90 bg-slate-900/90">
                    <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-1.5">
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.category === 'Cisco IOS' ? 'IOS CLI' : 'Shell'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.command)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/50 hover:text-white"
                      >
                        {isCopied ? (
                          <Check
                            className="h-3 w-3 text-emerald-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <Copy className="h-3 w-3" aria-hidden="true" />
                        )}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-emerald-300">
                      {item.command}
                    </pre>
                  </div>

                  {item.caution && (
                    <p className="mt-2 text-[11px] font-medium text-amber-300">
                      Caution: {item.caution}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
