<div align="center">

# Shivam Kumar Sinha — DevOps & Cloud Infrastructure Platform

**Verifiable Infrastructure Portfolio • Interactive Incident Response Lab • Client-Side DevSecOps Config Engine**

[![CI Build & Container Check](https://github.com/Shivam-Infra-Labs/shivam-devops-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Shivam-Infra-Labs/shivam-devops-portfolio/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage_Alpine-2496ED?style=flat-square&logo=docker&logoColor=white)
![Security](https://img.shields.io/badge/Security-Non--Root_%7C_HttpOnly_Auth-F59E0B?style=flat-square)
![Hosting](https://img.shields.io/badge/Infra_Cost-₹0_Serverless-10B981?style=flat-square)

[**Live Platform**](https://shivam-devops-portfolio.vercel.app) · [**DevSecOps ZIP Engine**](https://shivam-devops-portfolio.vercel.app/tools/generator) · [**Incident Lab**](https://shivam-devops-portfolio.vercel.app/incidents) · [**Scope Estimator**](https://shivam-devops-portfolio.vercel.app/quote)

</div>

---

## Why This Platform Exists

Traditional portfolios list tool logos without demonstrating **operational trade-offs, security hardening, or debugging methodology**. This repository powers a unified, zero-cost production platform designed for two audiences:

* **Engineering Hiring Managers:** Inspect live GitHub CI health, interactive Kubernetes/OSPF topologies, Architecture Decision Records (ADRs), and hands-on incident triage scenarios.
* **Startup Founders & Clients:** Configure deployment scopes interactively (`/quote`), generate hardened DevSecOps starter stacks in-browser (`/tools/generator`), and verify real delivery proofs.

---

## High-Level Architecture

┌───────────────────────────────────────────────────────────────────────────┐
│                     BROWSER RUNTIME (Zero External DB)                    │
│                                                                           │
│  ┌───────────────────┐  ┌──────────────────────┐  ┌────────────────────┐  │
│  │  Portfolio & ADR  │  │  JSZip DevSecOps     │  │  Incident Lab &    │  │
│  │  Proof Engine     │  │  35-File Generator   │  │  YAML/CLI Suite    │  │
│  └─────────┬─────────┘  └──────────┬───────────┘  └─────────┬──────────┘  │
└────────────┼───────────────────────┼────────────────────────┼─────────────┘
             │ ISR Cache (1 hr)      │ HMAC-SHA256 Verify     │ Web3Forms
             ▼                       ▼                        ▼
┌────────────────────────┐ ┌───────────────────────┐ ┌──────────────────────┐
│   GitHub REST API      │ │  Next.js Server APIs  │ │   Direct Lead Mail   │
│ (Repo Metrics & CI)    │ │ (/admin & /license)   │ │  (mrs228891@gmail)   │
└────────────────────────┘ └───────────────────────┘ └──────────────────────┘

---

## Core Modules & Capabilities

| Route | Module | Engineering Highlights |
| :--- | :--- | :--- |
| **`/`** | **Architecture & Proof Hub** | Interactive MEAN Kubernetes topology, LAMP-to-Compose migration walkthrough, CCNA OSPF/VLAN labs, Architecture Decision Records (ADRs), and live GitHub Actions CI status sync. |
| **`/tools/generator`** | **DevSecOps Bundle Generator** | 100% browser-local project archive analyzer generating up to **35 hardened files** (multi-stage `Dockerfile`, `compose.yaml`, K8s manifests, Helm, Terraform, Ansible, Trivy/Gitleaks CI). |
| **`/tools`** | **DevOps Productivity Hub** | IPv4 Subnet & Cisco OSPF Wildcard Mask Calculator, visual `chmod` / `docker run` / `kubectl` builder, Dockerfile/K8s Security Linter, and searchable CLI Cheat-Sheet Vault. |
| **`/incidents`** | **Incident Response Lab** | Interactive root-cause debugging drills covering `CrashLoopBackOff`, DNS/VLAN partitions, Nginx upstream timeouts, and Linux permission lockouts. |
| **`/quote`** | **Client Scope Estimator** | Real-time stack & timeline estimator with pre-filled inquiry handoff and printable PDF architecture scope brief. |
| **`/resume`** | **ATS-Ready Engineering CV** | Print-formatted engineering resume dynamically synced with central portfolio data. |
| **`/admin`** | **Server-Gated Control Panel** | Protected via `ADMIN_PASSWORD` + signed `HttpOnly` cookie; manages portfolio entries, drafts, and HMAC-SHA256 Pro license keys. |

---

## Security & DevOps Engineering Posture

* **Container Hardening (`Dockerfile` & `compose.yaml`):** 3-stage `node:20-alpine` standalone build running as non-root user `nextjs` (`UID 1001`), `no-new-privileges:true`, isolated bridge networking, and built-in `/api/health` readiness probes.
* **Zero-Secret Client Bundle:** Admin authentication and HMAC license signing execute strictly server-side; sensitive credentials never touch client-side JavaScript.
* **Automated CI Gate (`.github/workflows/ci.yml`):** Every push and PR to `main` validates dependency integrity (`npm ci`), ESLint rules, TypeScript compilation, production Next.js build, and multi-stage Docker image assembly.

---

<details>
<summary><b>Deployment & Local Setup Instructions (Click to Expand)</b></summary>

### 1. Local Development
git clone https://github.com/Shivam-Infra-Labs/shivam-devops-portfolio.git
cd shivam-devops-portfolio
cp .env.example .env
npm ci
npm run dev

### 2. Self-Hosted Container Deployment
cp .env.example .env
docker compose up -d --build

### 3. Environment Variables
| Variable | Scope | Description |
| :--- | :--- | :--- |
| `ADMIN_PASSWORD` | Server-only | Secures `/admin` dashboard and signs Pro license keys. |
| `GITHUB_REPOSITORY` | Server-only | Target `owner/repo` (`Shivam-Infra-Labs/shivam-devops-portfolio`) for Hero CI status polling. |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Public | Routes contact and `/quote` submissions directly to email (`mailto:` fallback supported). |
| `NEXT_PUBLIC_OWNER_MASTER_KEY` | Public | Owner key to unlock all 35 Pro artifacts in `/tools/generator`. |

</details>

---

## Connected Infrastructure Repositories

| Repository | Stack & Focus |
| :--- | :--- |
| [`mean-stack-example`](https://github.com/Shivam-Infra-Labs/mean-stack-example) | Containerized MEAN stack, Kind Kubernetes manifests, GitHub Actions smoke tests, Prometheus/Grafana metrics |
| [`Dockerized-grocery-store`](https://github.com/Shivam-Infra-Labs/Dockerized-grocery-store) | Multi-container web app with isolated Docker bridge networks and automated CI/CD workflows |
| [`-Grocery-Store-Deployment-using-LAMP-Stack-DevOps-Project-`](https://github.com/Shivam-Infra-Labs/-Grocery-Store-Deployment-using-LAMP-Stack-DevOps-Project-) | Linux, Apache, MySQL, and PHP server provisioning and production hardening |
| [`-Networking-Labs`](https://github.com/Shivam-Infra-Labs/-Networking-Labs) | Multi-area OSPF dynamic routing, 802.1Q VLAN trunking, Layer-3 SVI gateways, and static ISP failover |

---

<div align="center">

Engineered by **Shivam Kumar Sinha** • [GitHub](https://github.com/Shivam-Infra-Labs) • [LinkedIn](https://www.linkedin.com/in/shivam-kumar-sinha-0a9248308/)

</div>