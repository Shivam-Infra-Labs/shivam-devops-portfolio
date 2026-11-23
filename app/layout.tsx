import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { PortfolioProvider } from '@/src/context/PortfolioContext';
import { TerminalModal } from '@/src/components/TerminalModal';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

function resolveMetadataBase(): URL | undefined {
  const raw = process.env.APP_URL?.trim();
  if (!raw || raw === 'MY_APP_URL') return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

const SITE_TITLE = 'Shivam Kumar Sinha — DevOps & Cloud Infrastructure Portfolio';
const SITE_DESCRIPTION =
  'Kubernetes & Docker containerization, GitHub Actions CI smoke tests, Layer-3 CCNA routing labs, and freelance DevOps engineering by Shivam Kumar Sinha.';

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: SITE_TITLE,
    template: '%s',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Shivam Kumar Sinha',
    'DevOps Engineer',
    'Docker',
    'Kubernetes',
    'Kind',
    'GitHub Actions',
    'Cisco OSPF',
    'Prometheus',
    'Grafana',
    'Cloud Infrastructure',
  ],
  authors: [{ name: 'Shivam Kumar Sinha', url: 'https://github.com/Shivam-Infra-Labs' }],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'Shivam Kumar Sinha Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Shivam Kumar Sinha',
  jobTitle: 'DevOps & Cloud Infrastructure Engineer',
  url: 'https://github.com/Shivam-Infra-Labs',
  email: 'mailto:mrs228891@gmail.com',
  sameAs: [
    'https://github.com/Shivam-Infra-Labs',
    'https://www.linkedin.com/in/shivam-kumar-sinha-0a9248308/',
  ],
  knowsAbout: [
    'Docker',
    'Docker Compose',
    'Kubernetes',
    'GitHub Actions',
    'Nginx',
    'Prometheus',
    'Grafana',
    'Cisco OSPF',
    'Linux Administration',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500/25 selection:text-cyan-200"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
        <PortfolioProvider>
          {children}
          <TerminalModal />
        </PortfolioProvider>
      </body>
    </html>
  );
}
