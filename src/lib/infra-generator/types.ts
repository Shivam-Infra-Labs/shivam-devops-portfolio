export type DetectedStack = 'node' | 'nextjs' | 'php' | 'python';

export type DatabaseChoice =
  | 'none'
  | 'mongodb'
  | 'mysql'
  | 'postgresql'
  | 'redis';

export type CloudTarget = 'aws' | 'digitalocean' | 'linux-vps';

export type ArtifactDomainId =
  | 'containers'
  | 'devsecops'
  | 'proxy-ssl'
  | 'kubernetes'
  | 'helm'
  | 'cicd-gitops'
  | 'terraform'
  | 'ansible'
  | 'observability';

export interface ArtifactDomain {
  id: ArtifactDomainId;
  number: string;
  label: string;
  tier: 'free' | 'pro';
  summary: string;
}

export interface ArtifactDefinition {
  id: string;
  path: string;
  domainId: ArtifactDomainId;
  isPro: boolean;
  description: string;
  language: string;
}

export interface GeneratorParams {
  appName: string;
  stack: DetectedStack;
  runtimeVersion: string;
  port: number;
  database: DatabaseChoice;
  domain: string;
  cloudTarget: CloudTarget;
}

export interface ZipAnalysisResult {
  archiveName: string;
  fileCount: number;
  detectedStack: DetectedStack;
  stackLabel: string;
  runtimeVersion: string;
  suggestedPort: number;
  suggestedDatabase: DatabaseChoice;
  suggestedAppName: string;
  sensitiveFilesFound: string[];
  matchedSignals: string[];
}
