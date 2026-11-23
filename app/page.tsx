import { Navbar } from '@/src/components/Navbar';
import { HeroSection } from '@/src/components/HeroSection';
import { FeaturedProjectSection } from '@/src/components/FeaturedProjectSection';
import { EngineeringWorkSection } from '@/src/components/EngineeringWorkSection';
import { RoleProjectMatcher } from '@/src/components/RoleProjectMatcher';
import { AnnotatedConfigs } from '@/src/components/AnnotatedConfigs';
import { ServicesSection } from '@/src/components/ServicesSection';
import { AboutCredentialsSection } from '@/src/components/AboutCredentialsSection';
import { ContactSection } from '@/src/components/ContactSection';
import { Footer } from '@/src/components/Footer';
import {
  fetchCiWorkflowStatus,
  fetchGitHubRepoProofMap,
} from '@/src/lib/github';

export const revalidate = 3600;

export default async function HomePage() {
  const [repoProofMap, ciStatus] = await Promise.all([
    fetchGitHubRepoProofMap(),
    fetchCiWorkflowStatus(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <HeroSection ciStatus={ciStatus} />
        <FeaturedProjectSection repoProofMap={repoProofMap} />
        <EngineeringWorkSection repoProofMap={repoProofMap} />
        <RoleProjectMatcher />
        <AnnotatedConfigs />
        <ServicesSection />
        <AboutCredentialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
