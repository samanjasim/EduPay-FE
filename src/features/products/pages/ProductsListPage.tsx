import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Tag, School } from 'lucide-react';
import { Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination } from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useProducts } from '../api';
import { useSchools } from '@/features/schools/api';
import { useDebounce, usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import type { ProductType, ProductStatus, ProductListParams } from '@/types';

const statusBadgeVariant = (status: ProductStatus) => {
  const map: Record<ProductStatus, 'warning' | 'success' | 'default'> = {
    Draft: 'warning',
    Active: 'success',
    Disabled: 'default',
    Archived: 'default',
  };
  return map[status];
};

const STATUS_KEY_MAP: Record<ProductStatus, string> = {
  Draft: 'products.statusDraft',
  Active: 'products.statusActive',
  Disabled: 'products.statusDisabled',
  Archived: 'products.statusArchived',
};

const typeBadgeVariant = (_type: ProductType) => 'outline' as const;

const TYPE_KEY_MAP: Record<ProductType, string> = {
  Activity: 'products.typeActivity',
  Trip: 'products.typeTrip',
  Uniform: 'products.typeUniform',
  Books: 'products.typeBooks',
  Lab: 'products.typeLab',
  Transport: 'products.typeTransport',
  Other: 'products.typeOther',
};

const PAGE_SIZE = 9;

export default function ProductsListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch schools for the selector
  const { data: schoolsData } = useSchools();
  const schools = schoolsData?.data ?? [];

  // Auto-select first school
  useEffect(() => {
    if (!selectedSchoolId && schools.length > 0) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId]);

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
    { value: 'Archived', label: t('products.statusArchived') },
  ];

  const params: ProductListParams = {
    schoolId: selectedSchoolId,
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(typeFilter && { type: typeFilter as ProductType }),
    ...(statusFilter && { status: statusFilter as ProductStatus }),
  };

  const { data, isLoading } = useProducts(params);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('products.title')}
        subtitle={t('products.allProducts')}
        actions={
          hasPermission(PERMISSIONS.Products.Create) ? (
            <Link to={ROUTES.PRODUCTS.CREATE}>
              <Button leftIcon={<Plus className="h-4 w-4" />}>{t('products.createProduct')}</Button>
            </Link>
          ) : undefined
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {/* School Selector */}
            <div className="flex items-center gap-2 sm:max-w-[240px]">
              <School className="h-4 w-4 text-text-muted shrink-0" />
              <Select
                options={schoolOptions}
                value={selectedSchoolId}
                onChange={(val) => { setSelectedSchoolId(val); setPage(1); }}
                className="flex-1"
              />
            </div>
            <div className="sm:max-w-xs flex-1">
              <Input
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={handleSearchChange}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={handleTypeChange}
              className="sm:max-w-[180px]"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusChange}
              className="sm:max-w-[180px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title={t('common.noResults')} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} to={ROUTES.PRODUCTS.getDetail(product.id)}>
                <Card className="hover:shadow-soft-md transition-all duration-200 cursor-pointer h-full hover:border-primary-200 dark:hover:border-primary-500/30">
                  <CardContent className="py-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
                        <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <Badge variant={statusBadgeVariant(product.status)} size="sm">
                        {t(STATUS_KEY_MAP[product.status])}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-text-primary">{product.name}</h3>
                    {product.description && (
                      <p className="mt-1 text-sm text-text-muted line-clamp-2">{product.description}</p>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant={typeBadgeVariant(product.type)} size="sm">
                        <Tag className="mr-1 h-3 w-3" />
                        {t(TYPE_KEY_MAP[product.type])}
                      </Badge>
                      <span className="text-sm font-medium text-text-primary">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>
                          {product.academicYearStart}–{product.academicYearEnd}
                        </span>
                        {product.applicableGrade && (
                          <Badge variant="outline" size="sm">
                            {product.applicableGrade}
                            {product.applicableSection ? ` - ${product.applicableSection}` : ''}
                          </Badge>
                        )}
                      </div>
                      {product.maxQuantity != null && (
                        <span className="text-xs text-text-muted">
                          {t('products.maxQty')}: {product.maxQuantity}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
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
