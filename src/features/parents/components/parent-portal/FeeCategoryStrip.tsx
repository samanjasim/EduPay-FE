import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { CategoryIcon } from './CategoryIcon';
import type { ParentHomeFeeCategory } from '../../api/parent-portal.api';
import { useMarkFeeTypeSeen } from '../../api/parent-portal.queries';

interface Props {
  categories: ParentHomeFeeCategory[];
  onSelect?: (key: ParentHomeFeeCategory) => void;
}

const TONE_BY_KEY: Record<string, string> = {
  tuition: 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300',
  transport: 'bg-text-primary text-text-inverse',
  activities: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  canteen: 'bg-accent-100 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300',
};

export function FeeCategoryStrip({ categories, onSelect }: Props) {
  const { t } = useTranslation();
  const markSeen = useMarkFeeTypeSeen();

  const handleClick = (cat: ParentHomeFeeCategory) => {
    if (cat.feeTypeId && cat.hasUnseenChange) {
      markSeen.mutate(cat.feeTypeId);
    }
    onSelect?.(cat);
  };

  return (
    <ul className="-mx-1 flex gap-3 overflow-x-auto pb-1">
      {categories.map((cat) => (
        <li key={cat.key} className="shrink-0">
          <button
            type="button"
            onClick={() => handleClick(cat)}
            className={cn(
              'group relative flex h-32 w-28 flex-col justify-end rounded-3xl border border-border bg-surface p-3 text-start transition-all',
              'hover:-translate-y-0.5 hover:shadow-soft-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
          >
            <span
              className={cn(
                'absolute top-3 start-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl',
                TONE_BY_KEY[cat.key] ?? TONE_BY_KEY.tuition
              )}
            >
              <CategoryIcon iconKey={cat.iconKey} className="h-6 w-6" />
            </span>

            {cat.hasUnseenChange ? (
              <span
                aria-label={t('parent.categories.unseen')}
                className="absolute end-3 top-3 inline-flex h-2.5 w-2.5 rounded-full bg-primary-500"
              />
            ) : null}

            <span className="mt-2 text-sm font-semibold text-text-primary">
              {t(`parent.categories.${cat.key}`, cat.label)}
            </span>
            <span className="text-[11px] text-text-muted">
              {cat.dueCount === 0
                ? t('parent.categories.noDue')
                : t('parent.categories.dueCount', { count: cat.dueCount })}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
