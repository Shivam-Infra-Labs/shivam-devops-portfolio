import type { GeneratorParams } from './types';

export function renderCloudArtifact(
  artifactId: string,
  params: GeneratorParams
): string | null {
  const { appName, port, database, domain, cloudTarget } = params;

  switch (artifactId) {
    case 'k8s-namespace':
      return `apiVersion: v1
kind: Namespace
metadata:
  name: ${appName}
  labels:
    app.kubernetes.io/name: ${appName}
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/warn: restricted
`;

    case 'k8s-configmap':
      return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${appName}-config
  namespace: ${appName}
data:
  NODE_ENV: "production"
  PORT: "${port}"
  APP_DOMAIN: "${domain}"
  DATABASE_ENGINE: "${database}"
`;

    case 'k8s-secret-example':
      return `apiVersion: v1
kind: Secret
metadata:
  name: ${appName}-secrets
  namespace: ${appName}
type: Opaque
stringData:
  DATABASE_URL: "REPLACE_WITH_${database.toUpperCase()}_CONNECTION_URI"
  SESSION_SECRET: "REPLACE_WITH_RANDOM_32_BYTE_SECRET"
`;

    case 'k8s-deployment':
      return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  namespace: ${appName}
  labels:
    app: ${appName}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: ${appName}
          image: ghcr.io/shivam-infra-labs/${appName}:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: ${port}
          envFrom:
            - configMapRef:
                name: ${appName}-config
            - secretRef:
                name: ${appName}-secrets
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /
              port: ${port}
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: ${port}
            initialDelaySeconds: 20
            periodSeconds: 15
`;

    case 'k8s-service':
      return `apiVersion: v1
kind: Service
metadata:
  name: ${appName}
  namespace: ${appName}
spec:
  type: ClusterIP
  selector:
    app: ${appName}
  ports:
    - name: http
      port: 80
      targetPort: ${port}
`;

    case 'k8s-ingress':
      return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${appName}-ingress
  namespace: ${appName}
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - ${domain}
      secretName: ${appName}-tls
  rules:
    - host: ${domain}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${appName}
                port:
                  number: 80
`;

    case 'k8s-hpa':
      return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${appName}-hpa
  namespace: ${appName}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${appName}
  minReplicas: 2
  maxReplicas: 6
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
`;

    case 'k8s-network-policy':
      return `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${appName}-default-deny-and-allow
  namespace: ${appName}
spec:
  podSelector:
    matchLabels:
      app: ${appName}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - protocol: TCP
          port: ${port}
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
      ports:
        - protocol: UDP
          port: 53
`;

    case 'k8s-kyverno':
      return `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-non-root-${appName}
spec:
  validationFailureAction: Enforce
  background: true
  rules:
    - name: check-run-as-non-root
      match:
        any:
          - resources:
              kinds: ["Pod"]
              namespaces: ["${appName}"]
      validate:
        message: "Containers in ${appName} must enforce runAsNonRoot: true and drop ALL capabilities."
        pattern:
          spec:
            securityContext:
              runAsNonRoot: true
            containers:
              - securityContext:
                  allowPrivilegeEscalation: false
                  capabilities:
                    drop: ["ALL"]
`;

    case 'helm-chart':
      return `apiVersion: v2
name: ${appName}
description: Hardened Helm chart for ${appName}
type: application
version: 0.1.0
appVersion: "1.0.0"
`;

    case 'helm-values':
      return `replicaCount: 2
image:
  repository: ghcr.io/shivam-infra-labs/${appName}
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: ${port}

securityContext:
  runAsNonRoot: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
`;

    case 'helm-values-prod':
      return `replicaCount: 3

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 8
  targetCPUUtilizationPercentage: 70

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: ${domain}
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: ${appName}-tls
      hosts:
        - ${domain}
`;

    case 'cd-deploy-workflow':
      return `name: CD Release & Kind Smoke Verification

on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write

jobs:
  build-and-smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/\${{ github.repository }}:\${{ github.sha }}
            ghcr.io/\${{ github.repository }}:latest

      - name: Create Kind Cluster for Smoke Test
        uses: helm/kind-action@v1.10.0

      - name: Deploy Manifests & Verify Rollout
        run: |
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/configmap.yaml
          kubectl apply -f k8s/secret.example.yaml
          kubectl apply -f k8s/deployment.yaml
          kubectl apply -f k8s/service.yaml
          kubectl rollout status deployment/${appName} -n ${appName} --timeout=120s
`;

    case 'argocd-app':
      return `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ${appName}
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Shivam-Infra-Labs/${appName}.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: ${appName}
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
`;

    case 'tf-provider':
      if (cloudTarget === 'digitalocean') {
        return `terraform {
  required_version = ">= 1.6.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.38"
    }
  }
}

provider "digitalocean" {}
`;
      }
      return `terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = var.region
}
`;

    case 'tf-vpc-security':
      if (cloudTarget === 'digitalocean') {
        return `resource "digitalocean_firewall" "${appName}_fw" {
  name        = "${appName}-least-privilege-fw"
  droplet_ids = [digitalocean_droplet.${appName}_node.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = [var.admin_ssh_cidr]
  }
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}
`;
      }
      return `resource "aws_security_group" "${appName}_sg" {
  name        = "${appName}-least-privilege-sg"
  description = "Allow only HTTP/HTTPS public ingress and restricted SSH"

  ingress {
    description = "HTTP Redirect"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS TLS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Admin SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
`;

    case 'tf-compute':
      if (cloudTarget === 'digitalocean') {
        return `resource "digitalocean_droplet" "${appName}_node" {
  name     = "${appName}-prod"
  size     = var.instance_size
  image    = "ubuntu-24-04-x64"
  region   = var.region
  backups  = true
  monitoring = true
}
`;
      }
      return `resource "aws_instance" "${appName}_node" {
  ami                    = var.ubuntu_ami
  instance_type          = var.instance_size
  vpc_security_group_ids = [aws_security_group.${appName}_sg.id]

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = false
  }

  tags = {
    Name    = "${appName}-prod"
    Managed = "Terraform"
  }
}
`;

    case 'tf-variables':
      return `variable "region" {
  type    = string
  default = "${cloudTarget === 'digitalocean' ? 'blr1' : 'ap-south-1'}"
}

variable "instance_size" {
  type    = string
  default = "${cloudTarget === 'digitalocean' ? 's-1vcpu-2gb' : 't3.small'}"
}

variable "admin_ssh_cidr" {
  type        = string
  description = "Restrict SSH to your static admin IP/32"
  default     = "203.0.113.10/32"
}

variable "ubuntu_ami" {
  type    = string
  default = "ami-0f5ee92e2d63afc18"
}
`;

    case 'ansible-hardening':
      return `---
- name: Harden Linux VPS & Docker Host for ${appName}
  hosts: all
  become: true
  tasks:
    - name: Install UFW and Fail2Ban
      apt:
        name:
          - ufw
          - fail2ban
          - unattended-upgrades
        state: present
        update_cache: true

    - name: Configure UFW default deny & allow HTTP/HTTPS/SSH
      ufw:
        rule: "{{ item.rule }}"
        port: "{{ item.port }}"
        proto: tcp
      loop:
        - { rule: "allow", port: "22" }
        - { rule: "allow", port: "80" }
        - { rule: "allow", port: "443" }

    - name: Enable UFW firewall
      ufw:
        state: enabled
        policy: deny

    - name: Disable SSH root login & password authentication
      lineinfile:
        path: /etc/ssh/sshd_config
        regexp: "{{ item.regexp }}"
        line: "{{ item.line }}"
      loop:
        - { regexp: "^#?PermitRootLogin", line: "PermitRootLogin no" }
        - { regexp: "^#?PasswordAuthentication", line: "PasswordAuthentication no" }
      notify: Restart SSH

    - name: Harden Docker daemon defaults
      copy:
        dest: /etc/docker/daemon.json
        mode: "0644"
        content: |
          {
            "no-new-privileges": true,
            "live-restore": true,
            "log-driver": "json-file",
            "log-opts": { "max-size": "10m", "max-file": "3" }
          }

  handlers:
    - name: Restart SSH
      service:
        name: ssh
        state: restarted
`;

    case 'prometheus-yml':
      return `global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - /etc/prometheus/alert-rules.yml

scrape_configs:
  - job_name: "${appName}"
    static_configs:
      - targets: ["app:${port}"]

  - job_name: "node-exporter"
    static_configs:
      - targets: ["node-exporter:9100"]
`;

    case 'alert-rules-yml':
      return `groups:
  - name: ${appName}-alerts
    rules:
      - alert: ServiceTargetDown
        expr: up{job="${appName}"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "${appName} endpoint unreachable"

      - alert: HighHostMemoryPressure
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Host memory utilization exceeded 85%"
`;

    case 'compose-monitoring':
      return `services:
  prometheus:
    image: prom/prometheus:v2.53.0
    restart: unless-stopped
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./alert-rules.yml:/etc/prometheus/alert-rules.yml:ro
    ports:
      - "127.0.0.1:9090:9090"

  node-exporter:
    image: prom/node-exporter:v1.8.1
    restart: unless-stopped

  grafana:
    image: grafana/grafana:11.1.0
    restart: unless-stopped
    ports:
      - "127.0.0.1:3001:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: \${GRAFANA_PASSWORD:-change_me_local}
`;

    case 'makefile':
      return `APP_NAME := ${appName}

.PHONY: up down build scan backup

up:
\tdocker compose up -d --build

down:
\tdocker compose down

build:
\tdocker build -t $(APP_NAME):local .

scan:
\ttrivy image --severity CRITICAL,HIGH $(APP_NAME):local

backup:
\t./scripts/backup-db.sh
`;

    case 'backup-db': {
      const dumpCmd =
        database === 'mongodb'
          ? `docker compose exec -T db mongodump --archive --gzip > "\${BACKUP_DIR}/${appName}-\${STAMP}.gz"`
          : database === 'mysql'
          ? `docker compose exec -T db mysqldump -u"\${DB_USER:-appuser}" -p"\${DB_PASSWORD}" ${appName} | gzip > "\${BACKUP_DIR}/${appName}-\${STAMP}.sql.gz"`
          : database === 'postgresql'
          ? `docker compose exec -T db pg_dump -U "\${DB_USER:-appuser}" ${appName} | gzip > "\${BACKUP_DIR}/${appName}-\${STAMP}.sql.gz"`
          : database === 'redis'
          ? `docker compose exec -T db redis-cli BGSAVE && cp ./data/dump.rdb "\${BACKUP_DIR}/${appName}-\${STAMP}.rdb"`
          : `echo "No database service configured; backing up ./config" && tar -czf "\${BACKUP_DIR}/${appName}-\${STAMP}.tar.gz" .`;

      return `#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="./backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "\${BACKUP_DIR}"

echo "Creating ${database} backup for ${appName}..."
${dumpCmd}

# Retain backups for 7 days
find "\${BACKUP_DIR}" -type f -mtime +7 -delete
echo "Backup complete in \${BACKUP_DIR}"
`;
    }

    default:
      return null;
  }
}
