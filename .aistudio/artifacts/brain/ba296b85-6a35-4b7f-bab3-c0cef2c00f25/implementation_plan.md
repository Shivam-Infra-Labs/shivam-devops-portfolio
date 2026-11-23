# Shivam Kumar Sinha — DevOps & Cloud Infrastructure Portfolio (Part 1)

A fast, mobile-first DevOps portfolio built with Next.js 15 App Router, TypeScript, Tailwind CSS, Motion, and Lucide React—engineered for zero-cost hosting, verifiable engineering credibility, and seamless Part 2 Admin Panel extensibility.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Phase 1 Clarifications Confirmed**: The decisions below were confirmed during discovery and lock the scope and aesthetic direction for Part 1.

- **Focused Part 1 Scope**: Navigation and homepage sections focus purely on verifiable engineering work, hands-on labs, freelance services, credentials, resume, and contact. The `Tools` anchor is deferred to Part 2 while keeping the `incidentScenarios` and `generatorSettings` structures initialized in the central data schema.
- **Central Data Layer Ready for Part 2**: All site content lives in a central JSON store wrapped by a client context provider supporting `localStorage` draft overrides, with no public Admin UI exposed in Part 1.
- **Typography Pairing**: `Plus Jakarta Sans` serves as the display and body typeface paired with `JetBrains Mono` for technical identifiers, stack metadata, and tabular numerals.
- **Portrait Fallback Behavior**: The profile portrait loads `/profile.jpg` inside a subtle glowing ring and gracefully falls back to an `SK` monogram badge whenever the image file is unavailable.

---

## 1. Overview & Core Concept

- **What It Does**: Presents Shivam Kumar Sinha's verifiable containerization, Kubernetes, CI/CD, and Layer-3 networking work alongside two concrete freelance offerings, an interactive MEAN-on-Kind architecture diagram, printable ATS-ready resume, and direct inquiry workflow.
- **Target Audience / Persona**: Technical recruiters, hiring engineering managers looking for junior/associate DevOps & Cloud engineers, and startup/SMB clients seeking Dockerization or multi-container infrastructure setup.
- **Key Value**: Replaces unverified resume claims and generic buzzwords with inspectable proof—linking directly to GitHub repositories, concrete configuration deliverables, and exact architectural breakdowns.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **First-Impression & Navigation**: Visitors land on the `slate-950` hero framed by subtle cyan/emerald ambient lighting and drifting translucent infrastructure icon badges. The sticky glassmorphism navbar provides single-click jumps (`Projects`, `Labs`, `Services`, `About`, `Resume`) plus a primary `Contact Me` action.
2. **Featured Architecture & Case Study Inspection**: In the Featured Project section (`mean-stack-example`), visitors view an interactive SVG pipeline diagram (`GitHub Actions CI -> Docker Image -> Kind K8s Cluster -> Prometheus & Grafana`) with animated signal pulses. Mobile users can tap to expand a fullscreen zoom modal; any visitor can open the **Read Case Study** modal for contribution details and direct repo links.
3. **Engineering Work & Labs Exploration**: Three focused cards showcase the LAMP-to-Docker Compose migration story, the Enterprise CCNA Network Lab (`View Lab` direct repo link), and the Gyan Vatika Library web & QR attendance deployment.
4. **Freelance Service-to-Contact Pre-Fill**: Clicking **Request Quote** (*Dockerize My Application*) or **Get Architecture Plan** (*Set Up a Multi-Container Environment*) smoothly scrolls to the Contact section and automatically pre-populates the **Required Help** and **App Stack** fields.
5. **Printable Resume & Contact Submission**: Clicking `Resume` opens a dedicated ATS-friendly, light/print-clean resume route populated live from the central portfolio context with a one-click **Download / Print PDF** trigger. Submitting the Contact Form posts via Web3Forms (or falls back smoothly to a pre-filled `mailto:` action if no key is configured).

### Visual Identity & Theme

- **Aesthetic Direction**: Utilitarian dark-mode engineering craft—high-contrast, crisp structural borders, and subtle depth without visual clutter or pseudo-terminal gimmicks.
- **Color Palette & Mood (60-30-10)**:
  - *60% Dominant Canvas*: Deep `slate-950` (`#020617`) with subtle `cyan-500/10` and `emerald-500/10` radial ambient glows.
  - *30% Structural Surfaces*: `slate-900/70` translucent cards with `1px` `slate-800/80` hairline borders and muted `slate-400` secondary text.
  - *10% High-Intent Accent*: Crisp `cyan-400` / `emerald-400` highlights reserved strictly for primary CTAs, focus rings, interactive hover borders, and architecture flow indicators.
- **Typography & Hierarchy**: `Plus Jakarta Sans` (`clamp(2.25rem, 4vw, 3.5rem)` balanced hero headlines, `15px–16px` readable body) paired with `JetBrains Mono` (`tabular-nums`) for stack tags, port/service labels, and deliverables.
- **Component Styling & Layout**:
  - Clean 3-zone Top Bar (`Shivam Kumar Sinha` wordmark · 5 single-line nav links · `Contact Me` CTA, collapsing to a lightweight drawer on mobile).
  - Unboxed metadata separated by typographic dots (`·`) instead of pill-badge clutter, zero thick left accent bars, and single-level card elevation.
- **Interactive Feedback & Motion**: Smooth `viewport={{ once: true }}` scroll-reveal entrances (`transform` + `opacity` only), subtle spring hover lifts on project/service cards, animated SVG flow pulses, and `prefers-reduced-motion` support.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Central JSON + Context Draft Layer vs. Hardcoded Components**
  - *Chosen Approach*: Store all portfolio copy, links, projects, certifications, services, and deferred tool configs in a single typed JSON store consumed via `PortfolioProvider` with `localStorage` draft merge.
  - *Why*: Guarantees Part 2's Admin Panel can edit 100% of site content dynamically without refactoring UI components.
  - *Alternatives Considered*: Scattering copy across components or setting up a database in Part 1 (rejected to keep ₹0 static/serverless hosting and clean Part 1/Part 2 separation).

- **Decision 2: Zero-Cost Web3Forms + `mailto:` Fallback vs. Custom Mail Server**
  - *Chosen Approach*: Client-side submission to Web3Forms using `NEXT_PUBLIC_WEB3FORMS_KEY`, paired with an explicit `mailto:mrs228891@gmail.com` fallback action if the environment variable is absent or offline.
  - *Why*: Delivers reliable contact submissions at ₹0 hosting cost with zero backend maintenance.
  - *Alternatives Considered*: SMTP server or third-party paid email API (unnecessary complexity and secret management for a static-friendly portfolio).

- **Decision 3: Dedicated Printable `/resume` Route vs. Static PDF File**
  - *Chosen Approach*: Render `/resume` dynamically from `PortfolioContext` using print-optimized styling (`@media print`) and `window.print()`.
  - *Why*: Ensures any future Part 2 Admin Panel edits automatically update the downloadable PDF resume without manually re-exporting files.
  - *Alternatives Considered*: Hosting a static PDF in public assets (would drift out of sync with live portfolio data).

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Hierarchy

```text
┌────────────────────────────────────────────────────────────────────┐
│                        Central Portfolio JSON                      │
│   Hero · Featured Project · Engineering Work · Services · Creds    │
│   Education · Resume Meta · Incident Scenarios · Generator Config  │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │ loads defaults & merges
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    PortfolioProvider (Context)                     │
│        Reads localStorage draft overrides -> Exposes typed data    │
│        + Contact pre-fill bridge (selectedService / stack)         │
└───────────────┬───────────────────────────────────┬────────────────┘
                │                                   │
                ▼                                   ▼
┌───────────────────────────────┐   ┌────────────────────────────────┐
│       Homepage (/)            │   │     Resume Route (/resume)     │
│  ┌─────────────────────────┐  │   │  ATS-friendly layout           │
│  │ Navbar (3-zone sticky)  │  │   │  Live data from Context        │
│  ├─────────────────────────┤  │   │  Print / Save as PDF action    │
│  │ Hero + FloatingBg       │  │   └────────────────────────────────┘
│  │  └─ Portrait (SK fallbk)│  │
│  │  └─ 2 CTAs + Stack Strip│  │
│  ├─────────────────────────┤  │
│  │ Featured Project        │  │
│  │  ├─ SVG Arch Diagram    │  │   ┌──────────────────────────────┐
│  │  │   └─ Mobile Zoom     │──┼──▶│ Architecture Zoom Modal      │
│  │  └─ Read Case Study     │──┼──▶│ Case Study Detail Modal      │
│  ├─────────────────────────┤  │   └──────────────────────────────┘
│  │ More Engineering Work   │  │
│  │  ├─ LAMP -> Docker      │  │
│  │  ├─ CCNA Network Lab    │  │
│  │  └─ Gyan Vatika Library │  │
│  ├─────────────────────────┤  │
│  │ Freelance Services (2)  │  │
│  │  └─ Quote / Plan CTAs   │──┼──▶ Pre-fills & scrolls to Contact
│  ├─────────────────────────┤  │
│  │ About, Edu & Certs      │  │
│  ├─────────────────────────┤  │
│  │ Contact Form            │  │
│  │  └─ Web3Forms / mailto  │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### Data Model & State

- **Portfolio Data Schema**: Typed TypeScript interfaces covering `profile` (name, photo path, monogram fallback, headline, subheadline, availability, location, social links), `coreStack` (tool labels, categories, tooltips), `featuredProject` (repo URL, summary, architecture pipeline nodes, 3 contributions, case study details), `projects` (migration story, CCNA lab, Gyan Vatika Library), `services` (title, deliverables, proof project anchor, pre-fill payload), `about` & `education`, `certifications` (extensible array with issuer and verification URL), plus `incidentScenarios` and `generatorSettings` placeholders for Part 2.
- **UI & Interaction State**:
  - `activeCaseStudy`: Opens/closes the Featured Project case study modal with keyboard `ESC` and backdrop dismiss.
  - `isDiagramZoomOpen`: Opens/closes the mobile/tablet touch-friendly zoomed SVG architecture modal.
  - `contactPrefill`: Transient state updated by Freelance Service CTAs to populate the Contact Form's `appStack` and `requiredHelp` fields before smooth-scrolling into view.
  - `formStatus`: Tracks `idle | submitting | success | error` for Web3Forms POST requests with inline validation and `mailto:` fallback link.
  - `imageError`: Per-portrait boolean fallback switching `/profile.jpg` cleanly to the `SK` monogram inside the glowing ring.
