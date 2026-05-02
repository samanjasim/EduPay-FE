import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Search, Tag, School, Image as ImageIcon, GraduationCap, CalendarDays } from 'lucide-react';
import { Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { EmptyCatalogState } from '../components/EmptyCatalogState';
import { useProductSummaries } from '../api';
import { useSchools } from '@/features/schools/api';
import { useGrades } from '@/features/grades/api';
import { useDebounce, usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import type { ProductSummaryDto, ProductStatus, ProductListFilters } from '@/types';
import { format } from 'date-fns';

const statusBadgeVariant = (status: ProductStatus) => {
  const map: Record<ProductStatus, 'warning' | 'success' | 'default'> = {
    Draft: 'warning',
    Active: 'success',
    Disabled: 'default',
    Archived: 'default',
  };
  return map[status];
};

const PAGE_SIZE = 9;

function pickLocalizedName(p: ProductSummaryDto, lang: string): string {
  if (lang.startsWith('ar') && p.nameAr) return p.nameAr;
  if (lang.startsWith('ku') && p.nameKu) return p.nameKu;
  return p.nameEn;
}

function formatPriceRange(min: number, max: number, currency: string, lang: string) {
  const fmt = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  if (min === max) return fmt.format(min);
  return `${fmt.format(min)} – ${fmt.format(max)}`;
}

export default function ProductsListPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const { hasPermission } = usePermissions();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: schoolsData } = useSchools();
  const schools = schoolsData?.data ?? [];

  useEffect(() => {
    if (!selectedSchoolId && schools.length > 0) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId]);

  const { data: gradesData } = useGrades({ pageSize: 200 });
  const grades = gradesData?.data ?? [];

  const schoolOptions = schools.map((s) => ({ value: s.id, label: s.name }));

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

  const statusOptions = [
    { value: '', label: t('products.allStatuses') },
    { value: 'Draft', label: t('products.statusDraft') },
    { value: 'Active', label: t('products.statusActive') },
    { value: 'Disabled', label: t('products.statusDisabled') },
    { value: 'Archived', label: t('products.statusArchived') },
  ];

  const gradeOptions = [
    { value: '', label: t('products.allGrades') },
    ...grades.map((g) => ({ value: g.id, label: g.name })),
  ];

  const params: ProductListFilters = {
    schoolId: selectedSchoolId,
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(typeFilter && { type: typeFilter }),
    ...(statusFilter && { status: statusFilter as ProductStatus }),
    ...(gradeFilter && { gradeId: gradeFilter }),
  };

  const { data, isLoading } = useProductSummaries(params);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const filtersActive = !!(debouncedSearch || typeFilter || statusFilter || gradeFilter);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setGradeFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        actions={
          hasPermission(PERMISSIONS.Products.Create) ? (
            <Link to={ROUTES.PRODUCTS.CREATE}>
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                {t('products.createProduct')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="flex items-center gap-2 sm:max-w-[240px]">
              <School className="h-4 w-4 text-text-muted shrink-0" />
              <Select
                options={schoolOptions}
                value={selectedSchoolId}
                onChange={(val) => {
                  setSelectedSchoolId(val);
                  setPage(1);
                }}
                className="flex-1"
              />
            </div>
            <div className="sm:max-w-xs flex-1">
              <Input
                placeholder={t('common.search')}
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
              className="sm:max-w-[180px]"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              className="sm:max-w-[180px]"
            />
            <Select
              options={gradeOptions}
              value={gradeFilter}
              onChange={(v) => {
                setGradeFilter(v);
                setPage(1);
              }}
              className="sm:max-w-[180px]"
            />
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('products.clearFilters')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyCatalogState
          variant={filtersActive ? 'noMatches' : 'noProducts'}
          canCreate={hasPermission(PERMISSIONS.Products.Create)}
          onClearFilters={filtersActive ? clearFilters : undefined}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const title = pickLocalizedName(product, lang);
              return (
                <Link key={product.id} to={ROUTES.PRODUCTS.getDetail(product.id)}>
                  <Card className="h-full cursor-pointer transition-all duration-200 hover:border-primary-200 hover:shadow-soft-md dark:hover:border-primary-500/30">
                    <CardContent className="p-0">
                      {/* Image / placeholder */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-surface-100 dark:bg-surface-elevated">
                        {product.primaryImageFileId ? (
                          <img
                            src={`/api/Files/${product.primaryImageFileId}/download`}
                            alt={title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-text-muted" />
                          </div>
                        )}
                        <div className="absolute top-2 ltr:right-2 rtl:left-2">
                          <Badge variant={statusBadgeVariant(product.status)} size="sm">
                            {t(`products.status${product.status}`)}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 font-semibold text-text-primary">{title}</h3>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" size="sm">
                            <Tag className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                            {t(`products.type${product.type}`)}
                          </Badge>
                          {product.applicableGradeName && (
                            <Badge variant="outline" size="sm">
                              <GraduationCap className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                              {product.applicableGradeName}
                            </Badge>
                          )}
                          {product.availableUntil && (
                            <Badge variant="info" size="sm">
                              <CalendarDays className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                              {t('products.availableUntilShort', {
                                date: format(new Date(product.availableUntil), 'MMM d'),
                              })}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3 border-t border-border pt-3">
                          <span className="text-base font-semibold text-text-primary">
                            {formatPriceRange(product.minPrice, product.maxPrice, product.currency, lang)}
                          </span>
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

    </div>
  );
}
