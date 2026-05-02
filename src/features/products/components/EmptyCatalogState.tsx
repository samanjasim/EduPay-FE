import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config';

interface EmptyCatalogStateProps {
  variant?: 'noProducts' | 'noMatches';
  canCreate?: boolean;
  onClearFilters?: () => void;
}

/**
 * Empty state for the products list page.
 *
 * - `noProducts`: nothing has been created yet — show "create first product" CTA.
 * - `noMatches`: filters are active but yielded zero rows — show "clear filters" CTA.
 */
export function EmptyCatalogState({
  variant = 'noProducts',
  canCreate = false,
  onClearFilters,
}: EmptyCatalogStateProps) {
  const { t } = useTranslation();

  if (variant === 'noMatches') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-elevated">
          <Package className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-medium text-text-primary">{t('products.noMatchesTitle')}</h3>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          {t('products.noMatchesDesc')}
        </p>
        {onClearFilters && (
          <Button variant="secondary" onClick={onClearFilters} className="mt-4">
            {t('products.clearFilters')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/10">
        <Package className="h-10 w-10 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary">{t('products.emptyTitle')}</h3>
      <p className="mt-2 max-w-md text-sm text-text-secondary">{t('products.emptyDesc')}</p>
      {canCreate && (
        <Link to={ROUTES.PRODUCTS.CREATE} className="mt-5">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            {t('products.createFirstProduct')}
          </Button>
        </Link>
      )}
    </div>
  );
}
