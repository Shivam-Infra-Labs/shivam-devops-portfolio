import type { Metadata } from 'next';
import { Navbar } from '@/src/components/Navbar';
import { IncidentLab } from '@/src/components/IncidentLab';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: 'Incident Response Lab — Shivam Kumar Sinha',
  description:
    'Interactive Kubernetes (Kind), Cisco OSPF, and Nginx Docker Compose troubleshooting scenarios with triage commands, root causes, and interview summaries.',
};

export default function IncidentsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <IncidentLab />
      </main>
      <Footer />
    </div>
  );
}
