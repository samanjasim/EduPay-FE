import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { cn } from '@/utils';
import type { PaginationMeta } from '@/types';

export interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ pagination, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation();
  const { pageNumber, totalPages, totalCount, pageSize, hasPreviousPage, hasNextPage } = pagination;

  if (totalPages <= 1) return null;

  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalCount);

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 1;
    const start = Math.max(2, pageNumber - delta);
    const end = Math.min(totalPages - 1, pageNumber + delta);

    pages.push(1);
    if (start > 2) pages.push('ellipsis');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('ellipsis');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className="text-sm text-text-muted">
        {t('common.showing', { start: startItem, end: endItem, total: totalCount })}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </Button>

        {getPageNumbers().map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-text-muted">...</span>
          ) : (
            <Button
              key={page}
              variant={page === pageNumber ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[2rem]"
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={!hasNextPage}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
