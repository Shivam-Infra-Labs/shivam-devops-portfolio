import JSZip from 'jszip';
import type {
  DatabaseChoice,
  DetectedStack,
  ZipAnalysisResult,
} from './types';

const SENSITIVE_PATTERNS = [
  /(^|\/)\.env($|\.)/i,
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
  /(^|\/)id_rsa(\.pub)?$/i,
  /(^|\/)id_ed25519(\.pub)?$/i,
  /(^|\/)credentials\.json$/i,
  /(^|\/)service-account.*\.json$/i,
];

function sanitizeAppName(rawName: string): string {
  const cleaned = rawName
    .replace(/\.zip$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'my-app';
}

function isSensitivePath(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.env.example') || lower.endsWith('.env.template')) {
    return false;
  }
  return SENSITIVE_PATTERNS.some((rx) => rx.test(filePath));
}

export async function analyzeZipArchive(
  input: File | Blob,
  archiveName: string
): Promise<ZipAnalysisResult> {
  const zip = await JSZip.loadAsync(input);
  const paths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

  const sensitiveFilesFound = paths.filter(isSensitivePath);
  const matchedSignals: string[] = [];

  let detectedStack: DetectedStack = 'node';
  let stackLabel = 'Node.js / Express';
  let runtimeVersion = '20-alpine';
  let suggestedPort = 3000;
  let suggestedDatabase: DatabaseChoice = 'none';
  let suggestedAppName = sanitizeAppName(archiveName);

  const packageJsonPath = paths.find((p) => /(^|\/)package\.json$/i.test(p));
  const composerJsonPath = paths.find((p) => /(^|\/)composer\.json$/i.test(p));
  const requirementsPath = paths.find((p) =>
    /(^|\/)(requirements\.txt|pyproject\.toml)$/i.test(p)
  );
  const hasPhpFiles = paths.some((p) => /\.php$/i.test(p));
  const hasPyFiles = paths.some((p) => /\.py$/i.test(p));

  if (packageJsonPath) {
    try {
      const content = await zip.files[packageJsonPath].async('string');
      const pkg = JSON.parse(content) as {
        name?: string;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        engines?: { node?: string };
      };

      if (pkg.name) {
        suggestedAppName = sanitizeAppName(pkg.name);
      }

      const allDeps = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {}),
      };

      if (allDeps.next) {
        detectedStack = 'nextjs';
        stackLabel = 'Next.js';
        runtimeVersion = '20-alpine';
        suggestedPort = 3000;
        matchedSignals.push('package.json -> next');
      } else {
        detectedStack = 'node';
        stackLabel = 'Node.js / Express';
        runtimeVersion = '20-alpine';
        suggestedPort = allDeps.express ? 3000 : 8080;
        matchedSignals.push(
          allDeps.express ? 'package.json -> express' : 'package.json'
        );
      }

      if (allDeps.mongoose || allDeps.mongodb) {
        suggestedDatabase = 'mongodb';
        matchedSignals.push('MongoDB driver detected');
      } else if (allDeps.mysql2 || allDeps.mysql) {
        suggestedDatabase = 'mysql';
        matchedSignals.push('MySQL driver detected');
      } else if (allDeps.pg || allDeps['@prisma/client']) {
        suggestedDatabase = 'postgresql';
        matchedSignals.push('PostgreSQL / Prisma detected');
      } else if (allDeps.redis || allDeps.ioredis) {
        suggestedDatabase = 'redis';
        matchedSignals.push('Redis client detected');
      }
    } catch {
      matchedSignals.push('package.json detected');
    }
  } else if (composerJsonPath || hasPhpFiles) {
    detectedStack = 'php';
    stackLabel = 'PHP / LAMP';
    runtimeVersion = '8.3-apache';
    suggestedPort = 80;
    suggestedDatabase = 'mysql';
    matchedSignals.push(composerJsonPath ? 'composer.json' : '*.php sources');
  } else if (requirementsPath || hasPyFiles) {
    detectedStack = 'python';
    stackLabel = 'Python';
    runtimeVersion = '3.12-slim';
    suggestedPort = 8000;
    matchedSignals.push(requirementsPath ? requirementsPath : '*.py sources');

    if (requirementsPath) {
      const reqText = (await zip.files[requirementsPath].async('string')).toLowerCase();
      if (reqText.includes('psycopg') || reqText.includes('asyncpg')) {
        suggestedDatabase = 'postgresql';
        matchedSignals.push('PostgreSQL driver detected');
      } else if (reqText.includes('pymongo')) {
        suggestedDatabase = 'mongodb';
        matchedSignals.push('PyMongo detected');
      } else if (reqText.includes('pymysql') || reqText.includes('mysqlclient')) {
        suggestedDatabase = 'mysql';
        matchedSignals.push('MySQL driver detected');
      } else if (reqText.includes('redis')) {
        suggestedDatabase = 'redis';
        matchedSignals.push('Redis client detected');
      }
    }
  }

  return {
    archiveName,
    fileCount: paths.length,
    detectedStack,
    stackLabel,
    runtimeVersion,
    suggestedPort,
    suggestedDatabase,
    suggestedAppName,
    sensitiveFilesFound,
    matchedSignals:
      matchedSignals.length > 0 ? matchedSignals : ['Standard project layout'],
  };
}

export async function createSampleProjectZip(
  sampleType: 'mean' | 'nextjs'
): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();

  if (sampleType === 'mean') {
    zip.file(
      'package.json',
      JSON.stringify(
        {
          name: 'mean-stack-api',
          version: '1.0.0',
          scripts: { start: 'node server.js' },
          dependencies: {
            express: '^4.19.2',
            mongoose: '^8.4.0',
          },
        },
        null,
        2
      )
    );
    zip.file(
      'server.js',
      `const express = require('express');\nconst app = express();\napp.get('/health', (_req, res) => res.json({ status: 'ok' }));\napp.listen(process.env.PORT || 3000);\n`
    );
    // Include a sample .env so the Security Warning Banner demonstrates secret detection!
    zip.file('.env', 'PORT=3000\nMONGO_URI=mongodb://db:27017/mean\n');
    const blob = await zip.generateAsync({ type: 'blob' });
    return { blob, filename: 'sample-mean-app.zip' };
  }

  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'gyan-vatika-portal',
        version: '1.0.0',
        scripts: { build: 'next build', start: 'next start' },
        dependencies: {
          next: '^15.4.0',
          react: '^19.0.0',
          pg: '^8.12.0',
        },
      },
      null,
      2
    )
  );
  zip.file('app/page.tsx', 'export default function Page() { return <main>App</main>; }\n');
  const blob = await zip.generateAsync({ type: 'blob' });
  return { blob, filename: 'sample-nextjs-app.zip' };
}
