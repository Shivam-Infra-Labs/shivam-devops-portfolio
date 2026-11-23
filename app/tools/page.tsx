import type { Metadata } from 'next';
import { Navbar } from '@/src/components/Navbar';
import { ToolsHub } from '@/src/components/tools/ToolsHub';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: 'DevOps Tools Hub — Shivam Kumar Sinha',
  description:
    'Free client-side DevOps utilities: IPv4 Subnet & Cisco OSPF Wildcard Calculator, visual chmod/docker/kubectl Command Builder, and Production Security Readiness Audit.',
};

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <ToolsHub />
      </main>
      <Footer />
    </div>
  );
}
