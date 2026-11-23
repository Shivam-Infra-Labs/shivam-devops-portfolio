import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Navbar } from '@/src/components/Navbar';
import { AdminAuthGate } from '@/src/components/admin/AdminAuthGate';
import { Footer } from '@/src/components/Footer';
import {
  ADMIN_COOKIE_NAME,
  getConfiguredAdminPassword,
  verifySignedAdminToken,
} from '@/src/lib/adminAuth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Panel — Shivam Kumar Sinha Portfolio',
  description:
    'Protected portfolio content manager with instant localStorage preview, JSON export, and GitHub REST API publishing.',
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const initialAuthenticated = verifySignedAdminToken(token);
  const initialConfigured = Boolean(getConfiguredAdminPassword());

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <AdminAuthGate
          initialAuthenticated={initialAuthenticated}
          initialConfigured={initialConfigured}
        />
      </main>
      <Footer />
    </div>
  );
}
