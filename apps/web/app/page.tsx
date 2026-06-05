import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import ModulesSection from '@/components/home/ModulesSection';
import StatsSection from '@/components/home/StatsSection';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <main style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <ModulesSection />
      <StatsSection />
      <CTASection />
    </main>
  );
}
