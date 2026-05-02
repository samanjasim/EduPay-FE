import { useTranslation } from 'react-i18next';
import { LoadingScreen } from '@/components/common';
import { OnboardingCarousel } from '../components/OnboardingCarousel';
import { useParentOnboarding } from '../api/onboarding.queries';

export default function ParentOnboardingPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useParentOnboarding();

  if (isLoading) return <LoadingScreen />;

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-center text-text-secondary">{t('onboarding.loadError')}</p>
      </div>
    );
  }

  return <OnboardingCarousel data={data} />;
}
