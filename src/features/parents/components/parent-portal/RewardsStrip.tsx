import { ChevronRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ParentHomeRewards } from '../../api/parent-portal.api';

interface Props {
  rewards: ParentHomeRewards | null;
  onRedeem?: () => void;
}

export function RewardsStrip({ rewards, onRedeem }: Props) {
  const { t } = useTranslation();
  const balance = rewards?.balance ?? 0;

  return (
    <button
      type="button"
      onClick={onRedeem}
      disabled={!onRedeem}
      className="group flex w-full items-center justify-between rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_100%)] p-4 text-white transition-shadow hover:shadow-soft-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={t('parent.rewards.title')}
    >
      <span className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10">
          <Star className="h-5 w-5" aria-hidden />
        </span>
        <span className="flex flex-col text-start leading-tight">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {t('parent.rewards.title')}
          </span>
          <span className="text-base font-bold">
            <span>{balance.toLocaleString()}</span>
            <span className="ms-1 text-xs font-normal text-white/70">{t('parent.rewards.points')}</span>
          </span>
        </span>
      </span>

      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
        {t('parent.rewards.redeem')}
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
      </span>
    </button>
  );
}
