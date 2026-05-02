import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, GraduationCap, Image as ImageIcon, Tag } from 'lucide-react';
import {
  Card,
  CardContent,
  Spinner,
  Input,
  Select,
  Pagination,
  Badge,
  Button,
} from '@/components/ui';
import { PageHeader } from '@/components/common';
import { EmptyParentCatalogState } from '@/features/products/components/EmptyParentCatalogState';
import { useParentChildren } from '@/features/parents/api';
import { useParentCatalog } from '@/features/products/api';
import { useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/config';
import type { ParentCatalogFilters, ProductSummaryDto } from '@/types';

const PAGE_SIZE = 12;

function pickName(p: ProductSummaryDto, lang: string) {
  if (lang.startsWith('ar') && p.nameAr) return p.nameAr;
  if (lang.startsWith('ku') && p.nameKu) return p.nameKu;
  return p.nameEn;
}

/**
 * Parent self-service catalog. Web parity for the Flutter app — surfacing the
 * same browse-then-checkout flow so parents have a working path on desktop.
 *
 * Layout:
 *  - Child switcher (one per linked student).
 *  - Filter row (type + search).
 *  - Grid of product cards. Empty state per scenario.
 */
export default function ParentProductCatalogPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const user = useAuthStore((s) => s.user);
  const parentUserId = user?.id ?? '';

  const { data: children, isLoading: childrenLoading } =
    useParentChildren(parentUserId);

  // The active child id is "explicit if the user chose one, otherwise the
  // first child once they load". Computing this at render time keeps the
  // React Compiler happy (no setState-in-effect).
  const [explicitChildId, setExplicitChildId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const activeChildId =
    explicitChildId ||
    (children && children.length > 0 ? children[0].studentId : '');
  const setActiveChildId = setExplicitChildId;

  const filters: ParentCatalogFilters = useMemo(
    () => ({
      pageNumber: page,
      pageSize: PAGE_SIZE,
      ...(debouncedSearch ? { searchTerm: debouncedSearch } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
    }),
    [page, debouncedSearch, typeFilter]
  );

  const { data, isLoading } = useParentCatalog(activeChildId, filters);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const typeOptions = [
    { value: '', label: t('products.allTypes') },
    { value: 'Activity', label: t('products.typeActivity') },
    { value: 'Trip', label: t('products.typeTrip') },
    { value: 'Uniform', label: t('products.typeUniform') },
    { value: 'Books', label: t('products.typeBooks') },
    { value: 'Lab', label: t('products.typeLab') },
    { value: 'Transport', label: t('products.typeTransport') },
    { value: 'Other', label: t('products.typeOther') },
  ];

  const filtersActive = !!(debouncedSearch || typeFilter);

  const noChildren = !childrenLoading && (!children || children.length === 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('parentProducts.catalogTitle')}
        subtitle={t('parentProducts.catalogSubtitle')}
        actions={
          <Link to={ROUTES.PARENT_PRODUCTS.ORDERS}>
            <Button variant="secondary">
              {t('parentProducts.myOrders')}
            </Button>
          </Link>
        }
      />

      {/* Child switcher */}
      {childrenLoading ? (
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      ) : noChildren ? (
        <EmptyParentCatalogState variant="noChildren" />
      ) : (
        <>
          <Card>
            <CardContent className="py-3">
              <div className="flex flex-wrap gap-2">
                {(children ?? []).map((child) => {
                  const isActive = child.studentId === activeChildId;
                  return (
                    <button
                      type="button"
                      key={child.studentId}
                      onClick={() => {
                        setActiveChildId(child.studentId);
                        setPage(1);
                      }}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                          : 'border-border bg-surface hover:bg-hover/50'
                      }`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">
                        {child.fullNameEn || child.fullNameAr}
                      </span>
                      <span className="text-xs text-text-muted">{child.gradeName}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Input
                    placeholder={t('parentProducts.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                </div>
                <Select
                  options={typeOptions}
                  value={typeFilter}
                  onChange={(v) => {
                    setTypeFilter(v);
                    setPage(1);
                  }}
                  className="sm:max-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <EmptyParentCatalogState
              variant={filtersActive ? 'noMatches' : 'noProducts'}
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => {
                  const title = pickName(p, lang);
                  return (
                    <Link
                      key={p.id}
                      to={`${ROUTES.PARENT_PRODUCTS.getDetail(p.id)}?childId=${activeChildId}`}
                    >
                      <Card className="h-full cursor-pointer transition-all duration-200 hover:border-primary-200 hover:shadow-soft-md dark:hover:border-primary-500/30">
                        <CardContent className="p-0">
                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-surface-100 dark:bg-surface-elevated">
                            {p.primaryImageFileId ? (
                              <img
                                src={`/api/Files/${p.primaryImageFileId}/download`}
                                alt={title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-10 w-10 text-text-muted" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="line-clamp-2 font-semibold text-text-primary">
                              {title}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <Badge variant="outline" size="sm">
                                <Tag className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                                {t(`products.type${p.type}`)}
                              </Badge>
                            </div>
                            <div className="mt-3 border-t border-border pt-3 text-base font-semibold text-text-primary">
                              {p.minPrice === p.maxPrice
                                ? `${p.minPrice.toLocaleString()} ${p.currency}`
                                : `${p.minPrice.toLocaleString()} – ${p.maxPrice.toLocaleString()} ${p.currency}`}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination pagination={pagination} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
