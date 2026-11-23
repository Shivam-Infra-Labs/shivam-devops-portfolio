export type SocialPlatform =
  | 'github'
  | 'linkedin'
  | 'email'
  | 'upwork'
  | 'fiverr'
  | 'x'
  | 'custom';

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  platform: SocialPlatform;
  visible: boolean;
}

export interface ProfileData {
  name: string;
  monogram: string;
  photoUrl: string;
  headline: string;
  subheadline: string;
  availabilityActive: boolean;
  availabilityBadge: string;
  availabilityLine: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  socialLinks: SocialLink[];
}

export type StackIconKey =
  | 'docker'
  | 'kubernetes'
  | 'github-actions'
  | 'linux'
  | 'nginx'
  | 'prometheus'
  | 'cisco';

export interface StackItem {
  id: string;
  name: string;
  category: string;
  tooltip: string;
  iconKey: StackIconKey;
  visible: boolean;
}

export interface ArchitectureNode {
  id: string;
  stage: string;
  title: string;
  subtitle: string;
  detail: string;
  accent: 'cyan' | 'emerald' | 'sky';
}

export interface CaseStudyFile {
  path: string;
  purpose: string;
  repoFileUrl?: string;
}

export interface ArchitectureDecision {
  title: string;
  choice: string;
  tradeoff: string;
}

export interface FeaturedProjectData {
  id: string;
  visible: boolean;
  kicker: string;
  title: string;
  repoName: string;
  repoUrl: string;
  summary: string;
  stackTags: string[];
  contributions: string[];
  architectureNodes: ArchitectureNode[];
  caseStudy: {
    overview: string;
    problem: string;
    implementation: string[];
    files: CaseStudyFile[];
    outcome: string;
    decisions?: ArchitectureDecision[];
  };
}

export interface EngineeringProject {
  id: string;
  anchorId?: string;
  visible: boolean;
  category: string;
  kicker: string;
  title: string;
  repoName: string;
  summary: string;
  highlights: string[];
  stackTags: string[];
  primaryUrl: string;
  primaryLabel: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  liveUrl?: string;
  liveLabel?: string;
  decisions?: ArchitectureDecision[];
}

export interface ServiceOffering {
  id: string;
  visible: boolean;
  number: string;
  title: string;
  summary: string;
  deliverables: string[];
  proofLabel: string;
  proofAnchor: string;
  ctaLabel: string;
  prefillStack: string;
  prefillHelp: string;
}

export interface ContactSettings {
  recipientEmail: string;
  web3FormsKey: string;
  responseNote: string;
}

export interface EducationEntry {
  id: string;
  visible: boolean;
  degree: string;
  institution: string;
  years: string;
  details: string;
  focusAreas: string[];
}

export interface CertificationEntry {
  id: string;
  visible: boolean;
  title: string;
  issuer: string;
  year: string;
  category: string;
  summary: string;
  proofUrl: string;
  proofLabel: string;
}

export interface AboutData {
  intro: string;
  journey: string;
  highlights: string[];
}

export interface ResumeSkillGroup {
  group: string;
  items: string[];
}

export interface ResumeProjectEntry {
  title: string;
  subtitle: string;
  repoUrl: string;
  bullets: string[];
}

export interface ResumeData {
  summary: string;
  skillGroups: ResumeSkillGroup[];
  projects: ResumeProjectEntry[];
}

export interface IncidentTriageOption {
  id: string;
  label: string;
  command: string;
  output: string;
  insight: string;
  isPrimaryClue: boolean;
}

export interface IncidentFix {
  id: string;
  label: string;
  command: string;
  explanation: string;
}

export interface IncidentScenario {
  id: string;
  visible: boolean;
  title: string;
  category: string;
  severity: string;
  symptom: string;
  triageOptions: IncidentTriageOption[];
  rootCause: string;
  fixes: IncidentFix[];
  verificationCommand: string;
  verificationOutput: string;
  interviewSummary: string;
}

export interface GeneratorSettings {
  defaultBaseImage: string;
  defaultPort: number;
  enableHealthcheck: boolean;
  proPlanLabel: string;
  proPriceInr: string;
  proPriceUsd: string;
  paymentUrl: string;
}

export interface PortfolioData {
  profile: ProfileData;
  coreStack: StackItem[];
  featuredProject: FeaturedProjectData;
  engineeringWork: EngineeringProject[];
  services: ServiceOffering[];
  contactSettings: ContactSettings;
  about: AboutData;
  educationList: EducationEntry[];
  certifications: CertificationEntry[];
  resume: ResumeData;
  incidentScenarios: IncidentScenario[];
  generatorSettings: GeneratorSettings;
}
