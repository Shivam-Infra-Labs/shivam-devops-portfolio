import type { Metadata } from 'next';
import { Navbar } from '@/src/components/Navbar';
import { ResumeView } from '@/src/components/ResumeView';

export const metadata: Metadata = {
  title: 'Resume — Shivam Kumar Sinha | DevOps & Cloud Infrastructure',
  description:
    'Printable ATS-friendly resume for Shivam Kumar Sinha covering Kubernetes, Docker, GitHub Actions, Prometheus/Grafana, and CCNA networking.',
};

export default function ResumePage() {
  return (
    <>
      <Navbar />
      <ResumeView />
    </>
  );
}
