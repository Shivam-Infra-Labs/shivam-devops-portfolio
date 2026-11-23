import type { Metadata } from 'next';
import { Navbar } from '@/src/components/Navbar';
import { InfraGenerator } from '@/src/components/tools/InfraGenerator';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: 'DevSecOps & Cloud Infrastructure Generator — Shivam Kumar Sinha',
  description:
    'Analyze a project ZIP locally in your browser and generate multi-stage Dockerfiles, hardened Kubernetes manifests, Helm charts, DevSecOps CI workflows, Terraform, Ansible, and Prometheus configs.',
};

export default function GeneratorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <InfraGenerator />
      </main>
      <Footer />
    </div>
  );
}
