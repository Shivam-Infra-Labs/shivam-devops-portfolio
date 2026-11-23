import type { ArtifactDefinition, ArtifactDomain } from './types';

export const ARTIFACT_DOMAINS: ArtifactDomain[] = [
  {
    id: 'containers',
    number: '01',
    label: 'Containers',
    tier: 'free',
    summary: 'Multi-stage Alpine Dockerfile, hardened Compose & env templates',
  },
  {
    id: 'devsecops',
    number: '02',
    label: 'DevSecOps & Supply-Chain Security',
    tier: 'pro',
    summary: 'Gitleaks, Semgrep SAST, Checkov IaC, Trivy image gate & Syft SBOM',
  },
  {
    id: 'proxy-ssl',
    number: '03',
    label: 'Reverse Proxy & SSL Hardening',
    tier: 'pro',
    summary: 'Nginx HSTS/CSP/TLS 1.3 config & Let’s Encrypt bootstrap script',
  },
  {
    id: 'kubernetes',
    number: '04',
    label: 'Kubernetes Hardened Manifests',
    tier: 'pro',
    summary: 'Non-root pods, NetworkPolicies, HPA, Ingress & Kyverno policies',
  },
  {
    id: 'helm',
    number: '05',
    label: 'Helm Chart Packaging',
    tier: 'pro',
    summary: 'Reusable Chart.yaml, base values.yaml & production overrides',
  },
  {
    id: 'cicd-gitops',
    number: '06',
    label: 'CI/CD & GitOps Delivery',
    tier: 'pro',
    summary: 'Automated container release pipeline & ArgoCD Application sync',
  },
  {
    id: 'terraform',
    number: '07',
    label: 'Terraform Cloud IaC',
    tier: 'pro',
    summary: 'Least-privilege security groups, encrypted storage & compute IaC',
  },
  {
    id: 'ansible',
    number: '08',
    label: 'Ansible Server Hardening',
    tier: 'pro',
    summary: 'UFW firewall, Fail2Ban, SSH hardening & Docker daemon security',
  },
  {
    id: 'observability',
    number: '09',
    label: 'Observability, Alerts & Ops',
    tier: 'pro',
    summary: 'Prometheus, Grafana, Node Exporter, alerts, Makefile & DB backups',
  },
];

export const ARTIFACT_CATALOG: ArtifactDefinition[] = [
  // 1. Containers (Free Tier)
  {
    id: 'dockerfile',
    path: 'Dockerfile',
    domainId: 'containers',
    isPro: false,
    description: 'Multi-stage Alpine image with non-root USER & HEALTHCHECK',
    language: 'dockerfile',
  },
  {
    id: 'compose-yaml',
    path: 'compose.yaml',
    domainId: 'containers',
    isPro: false,
    description: 'Local multi-service Compose with no-new-privileges & bridge net',
    language: 'yaml',
  },
  {
    id: 'compose-prod-yaml',
    path: 'compose.prod.yaml',
    domainId: 'containers',
    isPro: false,
    description: 'Production overrides with resource limits & restart policies',
    language: 'yaml',
  },
  {
    id: 'dockerignore',
    path: '.dockerignore',
    domainId: 'containers',
    isPro: false,
    description: 'Excludes .git, node_modules, secrets & local build artifacts',
    language: 'text',
  },
  {
    id: 'env-example',
    path: '.env.example',
    domainId: 'containers',
    isPro: false,
    description: 'Documented runtime environment contract with zero secrets',
    language: 'text',
  },

  // 2. DevSecOps & Supply-Chain Security (Pro)
  {
    id: 'devsecops-workflow',
    path: '.github/workflows/devsecops-security.yml',
    domainId: 'devsecops',
    isPro: true,
    description: 'Gitleaks + Semgrep + Checkov + Trivy CRITICAL/HIGH gate + Syft SBOM',
    language: 'yaml',
  },
  {
    id: 'gitleaks-toml',
    path: '.gitleaks.toml',
    domainId: 'devsecops',
    isPro: true,
    description: 'Secret scanning ruleset & safe allowlist patterns',
    language: 'toml',
  },
  {
    id: 'pre-commit',
    path: '.pre-commit-config.yaml',
    domainId: 'devsecops',
    isPro: true,
    description: 'Local pre-commit hooks for Gitleaks, YAML lint & Hadolint',
    language: 'yaml',
  },
  {
    id: 'security-md',
    path: 'security/SECURITY.md',
    domainId: 'devsecops',
    isPro: true,
    description: 'Vulnerability disclosure policy & supply-chain controls',
    language: 'markdown',
  },

  // 3. Reverse Proxy & SSL Hardening (Pro)
  {
    id: 'nginx-conf',
    path: 'nginx/default.conf',
    domainId: 'proxy-ssl',
    isPro: true,
    description: 'TLS 1.3 reverse proxy with HSTS, CSP, X-Frame-Options & rate limits',
    language: 'nginx',
  },
  {
    id: 'init-letsencrypt',
    path: 'scripts/init-letsencrypt.sh',
    domainId: 'proxy-ssl',
    isPro: true,
    description: 'Automated Certbot TLS certificate issuance & renewal helper',
    language: 'bash',
  },

  // 4. Kubernetes Hardened Manifests (Pro)
  {
    id: 'k8s-namespace',
    path: 'k8s/namespace.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'Isolated namespace with Pod Security Standards enforcement labels',
    language: 'yaml',
  },
  {
    id: 'k8s-configmap',
    path: 'k8s/configmap.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'Non-sensitive runtime configuration values',
    language: 'yaml',
  },
  {
    id: 'k8s-secret-example',
    path: 'k8s/secret.example.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'Template Kubernetes Secret manifest (placeholders only)',
    language: 'yaml',
  },
  {
    id: 'k8s-deployment',
    path: 'k8s/deployment.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'Hardened Deployment: runAsNonRoot, drop ALL caps, probes & limits',
    language: 'yaml',
  },
  {
    id: 'k8s-service',
    path: 'k8s/service.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'ClusterIP Service exposing application HTTP port',
    language: 'yaml',
  },
  {
    id: 'k8s-ingress',
    path: 'k8s/ingress.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'TLS-enabled Ingress routing for custom domain',
    language: 'yaml',
  },
  {
    id: 'k8s-hpa',
    path: 'k8s/hpa.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'HorizontalPodAutoscaler targeting CPU & memory utilization',
    language: 'yaml',
  },
  {
    id: 'k8s-network-policy',
    path: 'k8s/network-policy.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'Default-deny ingress/egress NetworkPolicy with explicit allows',
    language: 'yaml',
  },
  {
    id: 'k8s-kyverno',
    path: 'k8s/kyverno-security-policy.yaml',
    domainId: 'kubernetes',
    isPro: true,
    description: 'Kyverno ClusterPolicy enforcing non-root & no privileged pods',
    language: 'yaml',
  },

  // 5. Helm Chart Packaging (Pro)
  {
    id: 'helm-chart',
    path: 'helm/Chart.yaml',
    domainId: 'helm',
    isPro: true,
    description: 'Helm v2 Chart metadata definition',
    language: 'yaml',
  },
  {
    id: 'helm-values',
    path: 'helm/values.yaml',
    domainId: 'helm',
    isPro: true,
    description: 'Base Helm chart values for image, service & securityContext',
    language: 'yaml',
  },
  {
    id: 'helm-values-prod',
    path: 'helm/values-prod.yaml',
    domainId: 'helm',
    isPro: true,
    description: 'Production Helm overrides for replicas, autoscaling & TLS ingress',
    language: 'yaml',
  },

  // 6. CI/CD & GitOps Delivery (Pro)
  {
    id: 'cd-deploy-workflow',
    path: '.github/workflows/cd-deploy.yml',
    domainId: 'cicd-gitops',
    isPro: true,
    description: 'GHCR image push + SHA tag deployment & smoke-check workflow',
    language: 'yaml',
  },
  {
    id: 'argocd-app',
    path: 'argocd/application.yaml',
    domainId: 'cicd-gitops',
    isPro: true,
    description: 'ArgoCD Application manifest for automated GitOps sync & prune',
    language: 'yaml',
  },

  // 7. Terraform Cloud IaC (Pro)
  {
    id: 'tf-provider',
    path: 'terraform/provider.tf',
    domainId: 'terraform',
    isPro: true,
    description: 'Pinned Terraform & cloud provider versions',
    language: 'hcl',
  },
  {
    id: 'tf-vpc-security',
    path: 'terraform/vpc-security.tf',
    domainId: 'terraform',
    isPro: true,
    description: 'Least-privilege security groups (80/443 only) & encrypted storage',
    language: 'hcl',
  },
  {
    id: 'tf-compute',
    path: 'terraform/compute.tf',
    domainId: 'terraform',
    isPro: true,
    description: 'Hardened compute instance & encrypted EBS/volume provisioning',
    language: 'hcl',
  },
  {
    id: 'tf-variables',
    path: 'terraform/variables.tf',
    domainId: 'terraform',
    isPro: true,
    description: 'Input variables for region, instance size & SSH CIDR allowlist',
    language: 'hcl',
  },

  // 8. Ansible Server Hardening (Pro)
  {
    id: 'ansible-hardening',
    path: 'ansible/playbook-server-hardening.yml',
    domainId: 'ansible',
    isPro: true,
    description: 'UFW firewall, Fail2Ban, SSH root/password disable & Docker daemon',
    language: 'yaml',
  },

  // 9. Observability, Alerts & Ops (Pro)
  {
    id: 'prometheus-yml',
    path: 'monitoring/prometheus.yml',
    domainId: 'observability',
    isPro: true,
    description: 'Prometheus scrape config for app, cAdvisor & Node Exporter',
    language: 'yaml',
  },
  {
    id: 'alert-rules-yml',
    path: 'monitoring/alert-rules.yml',
    domainId: 'observability',
    isPro: true,
    description: 'High CPU, memory pressure & endpoint down alerting rules',
    language: 'yaml',
  },
  {
    id: 'compose-monitoring',
    path: 'monitoring/docker-compose.monitoring.yml',
    domainId: 'observability',
    isPro: true,
    description: 'Prometheus + Grafana + Node Exporter observability stack',
    language: 'yaml',
  },
  {
    id: 'makefile',
    path: 'Makefile',
    domainId: 'observability',
    isPro: true,
    description: 'Standard up, down, scan, lint & backup developer targets',
    language: 'makefile',
  },
  {
    id: 'backup-db',
    path: 'scripts/backup-db.sh',
    domainId: 'observability',
    isPro: true,
    description: 'Timestamped database backup & retention cleanup script',
    language: 'bash',
  },
];

export const FREE_ARTIFACT_IDS = ARTIFACT_CATALOG.filter((a) => !a.isPro).map(
  (a) => a.id
);

export const ALL_ARTIFACT_IDS = ARTIFACT_CATALOG.map((a) => a.id);
