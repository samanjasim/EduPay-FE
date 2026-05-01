import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@/stores';
import { ROUTES } from '@/config';
import { LoadingScreen } from '@/components/common';
import { LandingNavbar } from '../components/layout/Navbar';
import { LandingFooter } from '../components/layout/Footer';
import { LandingSeo } from '../components/seo/Seo';
import { HeroCarousel } from '../components/marketing/HeroCarousel';
import { LogoCloud } from '../components/marketing/LogoCloud';
import { ProblemSolution } from '../components/marketing/ProblemSolution';
import { FeaturePillars } from '../components/marketing/FeaturePillars';
import { HowItWorks } from '../components/marketing/HowItWorks';
import { AudienceTabs } from '../components/marketing/AudienceTabs';
import { WalletPreview } from '../components/marketing/WalletPreview';
import { Pricing } from '../components/marketing/Pricing';
import { Roadmap } from '../components/marketing/Roadmap';
import { Trust } from '../components/marketing/Trust';
import { FAQ } from '../components/marketing/FAQ';
import { FinalCTA } from '../components/marketing/FinalCTA';

export default function LandingPage() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);

  // Hash-anchor smooth scrolling on initial load (e.g. /#features deep-links)
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (isLoading) return <LoadingScreen />;

  // Authenticated users skip the marketing site and go straight to their workspace.
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <>
      <LandingSeo />
      <LandingNavbar />
      <main id="main">
        <HeroCarousel />
        <LogoCloud />
        <ProblemSolution />
        <FeaturePillars />
        <HowItWorks />
        <AudienceTabs />
        <WalletPreview />
        <Pricing />
        <Roadmap />
        <Trust />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </>
  );
}
