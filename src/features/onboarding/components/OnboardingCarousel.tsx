import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import type { OnboardingResponse, OnboardingCta } from '../api/onboarding.api';
import { OnboardingSlideContent } from './OnboardingSlide';
import { useCompleteParentOnboarding } from '../api/onboarding.queries';
import { useAuthStore } from '@/stores';

interface OnboardingCarouselProps {
  data: OnboardingResponse;
}

export function OnboardingCarousel({ data }: OnboardingCarouselProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const complete = useCompleteParentOnboarding();
  const [index, setIndex] = useState(0);

  const slide = data.slides[index];
  if (!slide) return null;

  const isLast = index === data.slides.length - 1;

  const handleAction = async (cta: OnboardingCta) => {
    if (cta.action === 'next') {
      setIndex((i) => Math.min(i + 1, data.slides.length - 1));
      return;
    }

    if (isAuthenticated) {
      try {
        await complete.mutateAsync(data.version);
      } catch {
        // Non-fatal — user can re-tap; landing route still moves them along.
      }
      navigate(ROUTES.DASHBOARD);
      return;
    }

    if (cta.action === 'register') {
      navigate(ROUTES.REGISTER);
    } else if (cta.action === 'login') {
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSkip = async () => {
    if (isAuthenticated) {
      try {
        await complete.mutateAsync(data.version);
      } catch {
        /* no-op */
      }
      navigate(ROUTES.DASHBOARD);
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      {/* Top bar with Skip on every slide except the last */}
      <div className="flex items-center justify-end px-6 pt-6">
        {!isLast && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            {t('onboarding.skip')}
          </button>
        )}
      </div>

      {/* Indicator dots */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {data.slides.map((s, i) => (
          <span
            key={s.key}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-text-primary' : 'w-1.5 bg-text-muted/40'
            )}
            aria-hidden
          />
        ))}
      </div>

      {/* Slide */}
      <OnboardingSlideContent slide={slide} />

      {/* CTAs */}
      <div className="space-y-3 px-6 pb-10 pt-6">
        <Button
          type="button"
          className="w-full"
          isLoading={complete.isPending && slide.primaryCta.action !== 'next'}
          onClick={() => handleAction(slide.primaryCta)}
          rightIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}
        >
          {slide.primaryCta.label}
        </Button>

        {slide.secondaryCta && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => handleAction(slide.secondaryCta!)}
          >
            {slide.secondaryCta.label}
          </Button>
        )}
      </div>
    </div>
  );
}
