import { Backpack, CreditCard, Gift } from 'lucide-react';
import type { OnboardingIconKey } from '../api/onboarding.api';

/**
 * Maps the BE-provided iconKey to a lightweight React illustration.
 * Bundled in the client so the carousel paints even if the slides API is slow.
 * For richer art later, swap any of these for SVG imports.
 */
export function OnboardingIllustration({ iconKey }: { iconKey: OnboardingIconKey }) {
  switch (iconKey) {
    case 'school-bag':
      return <SchoolBagArt />;
    case 'card-stack':
      return <CardStackArt />;
    case 'gift-box':
      return <GiftBoxArt />;
    default:
      return (
        <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
          <Gift size={56} aria-hidden />
        </div>
      );
  }
}

function SchoolBagArt() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-primary-500/15 via-transparent to-accent-500/15 blur-xl" aria-hidden />
      <div className="flex h-44 w-44 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#1e3a8a,#2563eb)] shadow-soft-lg">
        <Backpack className="h-20 w-20 text-white/95" aria-hidden />
      </div>
      <span className="absolute -top-2 -end-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white shadow-soft-md">$</span>
    </div>
  );
}

function CardStackArt() {
  return (
    <div className="relative h-44 w-56">
      <div className="absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br from-primary-500/15 via-transparent to-accent-500/15 blur-xl" aria-hidden />
      <div className="absolute start-0 top-4 h-32 w-44 -rotate-6 rounded-2xl bg-[linear-gradient(135deg,#0f172a,#1e3a8a)] shadow-soft-md" />
      <div className="absolute start-6 top-2 h-32 w-44 rotate-1 rounded-2xl bg-[linear-gradient(135deg,#a7f3d0,#10b981)] shadow-soft-md opacity-70" />
      <div className="absolute start-10 top-0 flex h-32 w-44 rotate-6 flex-col justify-between rounded-2xl bg-[linear-gradient(135deg,#60a5fa,#34d399)] p-3 shadow-soft-lg">
        <CreditCard className="h-5 w-5 text-white/85" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-white">3 / 6 / 12</span>
      </div>
    </div>
  );
}

function GiftBoxArt() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-amber-500/20 via-transparent to-pink-500/20 blur-xl" aria-hidden />
      <div className="flex h-44 w-44 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#f97316,#ec4899)] shadow-soft-lg">
        <Gift className="h-20 w-20 text-white/95" aria-hidden />
      </div>
      <span className="absolute -bottom-2 -end-2 inline-flex h-10 items-center rounded-full bg-text-primary px-3 text-xs font-bold text-text-inverse shadow-soft-md">+ 50 pts</span>
    </div>
  );
}
