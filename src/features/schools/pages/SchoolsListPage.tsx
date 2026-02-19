import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, School, Search } from 'lucide-react';
import { Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination } from '@/components/ui';
import { EmptyState } from '@/components/common';
import { useSchools } from '../api';
import { useDebounce, useUserRole } from '@/hooks';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import type { SchoolStatus, SchoolListParams } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Deactivated', label: 'Deactivated' },
];

const statusBadgeVariant = (status: SchoolStatus) => {
  const map: Record<SchoolStatus, 'warning' | 'success' | 'error' | 'default'> = {
    Pending: 'warning',
    Active: 'success',
    Suspended: 'error',
    Deactivated: 'default',
  };
  return map[status];
};

const PAGE_SIZE = 9;

export default function SchoolsListPage() {
  const { t } = useTranslation();
  const { isPlatformAdmin } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const params: SchoolListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as SchoolStatus }),
  };

  const { data, isLoading } = useSchools(params);
  const schools = data?.items ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('schools.title')}</h1>
          <p className="text-text-secondary">{t('schools.allSchools')}</p>
        </div>
        {isPlatformAdmin && (
          <Link to={ROUTES.SCHOOLS.CREATE}>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('schools.createSchool')}</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:max-w-xs flex-1">
          <Input
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={handleStatusChange}
          placeholder={t('schools.filterByStatus')}
          className="sm:max-w-[200px]"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : schools.length === 0 ? (
        <EmptyState icon={School} title={t('common.noResults')} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Link key={school.id} to={ROUTES.SCHOOLS.getDetail(school.id)}>
                <Card className="hover:shadow-soft-md transition-shadow cursor-pointer h-full">
                  <CardContent className="py-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                        {school.logoUrl ? (
                          <img src={school.logoUrl} alt={school.name} className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <School className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <Badge variant={statusBadgeVariant(school.status)} size="sm">
                        {school.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-text-primary">{school.name}</h3>
                    <p className="mt-1 text-sm text-text-muted">{school.code}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
                      <span>{school.city}</span>
                      <Badge variant="outline" size="sm">{school.subscriptionPlan}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-text-muted">
                      {format(new Date(school.createdAt), 'MMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
