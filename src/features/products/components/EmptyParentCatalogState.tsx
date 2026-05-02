import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';

interface EmptyParentCatalogStateProps {
  variant?: 'noChildren' | 'noProducts' | 'noMatches';
}

/**
 * Empty state for the parent-side catalog. Three flavours:
 *  - `noChildren`: parent has no enrolled children (rare — should be filtered upstream).
 *  - `noProducts`: child is enrolled but the school hasn't published any catalog items
 *                  this child is eligible for.
 *  - `noMatches`: filters yielded zero rows.
 */
export function EmptyParentCatalogState({
  variant = 'noProducts',
}: EmptyParentCatalogStateProps) {
  const { t } = useTranslation();

  const titleKey =
    variant === 'noChildren'
      ? 'parentProducts.emptyNoChildrenTitle'
      : variant === 'noMatches'
        ? 'parentProducts.emptyNoMatchesTitle'
        : 'parentProducts.emptyNoProductsTitle';

  const descKey =
    variant === 'noChildren'
      ? 'parentProducts.emptyNoChildrenDesc'
      : variant === 'noMatches'
        ? 'parentProducts.emptyNoMatchesDesc'
        : 'parentProducts.emptyNoProductsDesc';

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/10">
        <ShoppingBag className="h-10 w-10 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary">{t(titleKey)}</h3>
      <p className="mt-2 max-w-md text-sm text-text-secondary">{t(descKey)}</p>
    </div>
  );
}
