import type { Metadata } from 'next';
import { Navbar } from '@/src/components/Navbar';
import { QuoteEstimator } from '@/src/components/QuoteEstimator';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: 'DevOps Quote & Scope Estimator — Shivam Kumar Sinha',
  description:
    'Configure your application stack, CI/CD, Nginx SSL, and monitoring scope to get an estimated delivery timeline and printable client scope brief.',
};

export default function QuotePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 print:bg-white print:text-slate-900">
      <Navbar />
      <main className="flex-1 print:p-0">
        <QuoteEstimator />
      </main>
      <Footer />
    </div>
  );
}
