import type { GeneratorParams } from './types';

function renderDbServiceBlock(params: GeneratorParams): string {
  const { database, appName } = params;
  switch (database) {
    case 'mongodb':
      return `  db:
    image: mongo:7.0
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    environment:
      MONGO_INITDB_DATABASE: ${appName}
    volumes:
      - db_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 15s
      timeout: 5s
      retries: 5
    networks:
      - internal_net`;
    case 'mysql':
      return `  db:
    image: mysql:8.4
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    environment:
      MYSQL_DATABASE: ${appName}
      MYSQL_USER: \${DB_USER:-appuser}
      MYSQL_PASSWORD: \${DB_PASSWORD:-changeme_local}
      MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASSWORD:-changeme_root}
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 15s
      timeout: 5s
      retries: 5
    networks:
      - internal_net`;
    case 'postgresql':
      return `  db:
    image: postgres:16-alpine
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    environment:
      POSTGRES_DB: ${appName}
      POSTGRES_USER: \${DB_USER:-appuser}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-changeme_local}
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-appuser} -d ${appName}"]
      interval: 15s
      timeout: 5s
      retries: 5
    networks:
      - internal_net`;
    case 'redis':
      return `  db:
    image: redis:7-alpine
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - db_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal_net`;
    default:
      return '';
  }
}

function renderDockerfile(params: GeneratorParams): string {
  const { stack, port, runtimeVersion } = params;

  if (stack === 'php') {
    return `FROM php:${runtimeVersion} AS runtime
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends curl \\
  && docker-php-ext-install pdo pdo_mysql mysqli \\
  && rm -rf /var/lib/apt/lists/*

COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

USER www-data
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \\
  CMD curl -fsS http://127.0.0.1:${port}/ || exit 1
`;
  }

  if (stack === 'python') {
    return `FROM python:${runtimeVersion} AS builder
WORKDIR /build
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt ./
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt

FROM python:${runtimeVersion} AS runtime
WORKDIR /app
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache /wheels/* && rm -rf /wheels
COPY --chown=appuser:appgroup . .

USER appuser
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:${port}/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${port}"]
`;
  }

  if (stack === 'nextjs') {
    return `FROM node:${runtimeVersion} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${runtimeVersion} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:${runtimeVersion} AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=${port}

COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json

USER node
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \\
  CMD wget -qO- http://127.0.0.1:${port}/ >/dev/null 2>&1 || exit 1

CMD ["npm", "run", "start"]
`;
  }

  return `FROM node:${runtimeVersion} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:${runtimeVersion} AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=${port}

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node
EXPOSE ${port}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \\
  CMD wget -qO- http://127.0.0.1:${port}/health >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
`;
}

export function renderCoreArtifact(
  artifactId: string,
  params: GeneratorParams
): string | null {
  const { appName, port, database, domain } = params;
  const dbBlock = renderDbServiceBlock(params);
  const hasDb = database !== 'none';

  switch (artifactId) {
    case 'dockerfile':
      return renderDockerfile(params);

    case 'compose-yaml':
      return `services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${appName}-app
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    env_file:
      - .env
    ports:
      - "${port}:${port}"
${
  hasDb
    ? `    depends_on:
      db:
        condition: service_healthy
    networks:
      - edge_net
      - internal_net

${dbBlock}

volumes:
  db_data: {}`
    : `    networks:
      - edge_net`
}

networks:
  edge_net:
    driver: bridge
${
  hasDb
    ? `  internal_net:
    driver: bridge
    internal: true`
    : ''
}
`;

    case 'compose-prod-yaml':
      return `services:
  app:
    image: ghcr.io/shivam-infra-labs/${appName}:latest
    restart: always
    read_only: false
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          cpus: "0.75"
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:1.25-alpine
    restart: always
    security_opt:
      - no-new-privileges:true
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
    networks:
      - edge_net
`;

    case 'dockerignore':
      return `.git
.gitignore
node_modules
.next
__pycache__
*.pyc
.env
.env.*
!.env.example
*.pem
*.key
id_rsa*
dist
coverage
`;

    case 'env-example': {
      const dbEnv =
        database === 'mongodb'
          ? `MONGO_URI=mongodb://db:27017/${appName}`
          : database === 'mysql'
          ? `DB_HOST=db\nDB_PORT=3306\nDB_NAME=${appName}\nDB_USER=appuser\nDB_PASSWORD=replace_with_strong_secret\nDB_ROOT_PASSWORD=replace_with_root_secret`
          : database === 'postgresql'
          ? `DATABASE_URL=postgresql://appuser:replace_with_strong_secret@db:5432/${appName}\nDB_USER=appuser\nDB_PASSWORD=replace_with_strong_secret`
          : database === 'redis'
          ? `REDIS_URL=redis://db:6379`
          : `# No external database configured`;

      return `# Runtime contract for ${appName} — NEVER commit .env with real secrets
NODE_ENV=production
PORT=${port}
APP_DOMAIN=${domain}
${dbEnv}
`;
    }

    case 'devsecops-workflow':
      return `name: DevSecOps Supply-Chain Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  security-events: write

jobs:
  secret-and-sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Gitleaks Secret Scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Semgrep SAST Scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/default

      - name: Checkov IaC Security Scan
        uses: bridgecrewio/checkov-action@v12
        with:
          directory: .
          soft_fail: false

  container-gate-and-sbom:
    needs: secret-and-sast
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Container Image
        run: docker build -t ${appName}:\${{ github.sha }} .

      - name: Trivy CRITICAL/HIGH Vulnerability Gate
        uses: aquasecurity/trivy-action@0.24.0
        with:
          image-ref: ${appName}:\${{ github.sha }}
          format: table
          exit-code: "1"
          ignore-unfixed: true
          severity: CRITICAL,HIGH

      - name: Generate CycloneDX SBOM with Syft
        uses: anchore/sbom-action@v0
        with:
          image: ${appName}:\${{ github.sha }}
          output-file: ${appName}-sbom.cdx.json

      - name: Upload SBOM Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${appName}-sbom
          path: ${appName}-sbom.cdx.json
`;

    case 'gitleaks-toml':
      return `title = "Gitleaks Policy for ${appName}"

[extend]
useDefault = true

[allowlist]
description = "Ignore example templates and documentation"
paths = [
  '''\\.env\\.example$''',
  '''k8s/secret\\.example\\.yaml$''',
  '''security/SECURITY\\.md$''',
]
`;

    case 'pre-commit':
      return `repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
  - repo: https://github.com/hadolint/hadolint
    rev: v2.12.0
    hooks:
      - id: hadolint-docker
  - repo: https://github.com/adrienverge/yamllint
    rev: v1.35.1
    hooks:
      - id: yamllint
`;

    case 'security-md':
      return `# Security Policy — ${appName}

## Supply-Chain & Runtime Controls
- Container images run as non-root user with multi-stage Alpine builds.
- Secrets are never committed to Git; runtime configuration uses \`.env.example\` contracts.
- CI blocks merges with leaked secrets (Gitleaks), SAST findings (Semgrep), IaC misconfigurations (Checkov), or unfixed CRITICAL/HIGH CVEs (Trivy).
- CycloneDX SBOM artifacts are generated on every build via Syft.

## Reporting a Vulnerability
Please report suspected vulnerabilities privately to the repository maintainer before public disclosure.
`;

    case 'nginx-conf':
      return `limit_req_zone $binary_remote_addr zone=api_limit:10m rate=15r/s;

server {
    listen 80;
    server_name ${domain};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ${domain};

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none';" always;

    location / {
        limit_req zone=api_limit burst=30 nodelay;
        proxy_pass http://app:${port};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;

    case 'init-letsencrypt':
      return `#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${domain}"
EMAIL="admin@${domain}"

echo "Requesting Let's Encrypt TLS certificate for \${DOMAIN}..."
docker run --rm \\
  -v /etc/letsencrypt:/etc/letsencrypt \\
  -v /var/www/certbot:/var/www/certbot \\
  certbot/certbot certonly --webroot \\
  -w /var/www/certbot \\
  -d "\${DOMAIN}" \\
  --email "\${EMAIL}" \\
  --agree-tos \\
  --non-interactive

echo "Reloading Nginx with TLS 1.3 configuration..."
docker compose -f compose.yaml -f compose.prod.yaml exec nginx nginx -s reload
`;

    default:
      return null;
  }
}
