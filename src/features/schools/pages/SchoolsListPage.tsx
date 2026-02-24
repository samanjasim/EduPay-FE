import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, School, Search } from 'lucide-react';
import { Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination } from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useSchools } from '../api';
import { useDebounce, usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import type { SchoolStatus, SchoolListParams } from '@/types';

const statusBadgeVariant = (status: SchoolStatus) => {
  const map: Record<SchoolStatus, 'warning' | 'success' | 'error' | 'default'> = {
    Pending: 'warning',
    Active: 'success',
    Suspended: 'error',
    Deactivated: 'default',
  };
  return map[status];
};

const STATUS_KEY_MAP: Record<SchoolStatus, string> = {
  Pending: 'schools.statusPending',
  Active: 'schools.statusActive',
  Suspended: 'schools.statusSuspended',
  Deactivated: 'schools.statusDeactivated',
};

const PAGE_SIZE = 9;

export default function SchoolsListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const statusOptions = [
    { value: '', label: t('schools.allStatuses') },
    { value: 'Pending', label: t('schools.statusPending') },
    { value: 'Active', label: t('schools.statusActive') },
    { value: 'Suspended', label: t('schools.statusSuspended') },
    { value: 'Deactivated', label: t('schools.statusDeactivated') },
  ];

  const params: SchoolListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as SchoolStatus }),
  };

  const { data, isLoading } = useSchools(params);
  const schools = data?.data ?? [];
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
      <PageHeader
        title={t('schools.title')}
        subtitle={t('schools.allSchools')}
        actions={
          hasPermission(PERMISSIONS.Schools.Create) ? (
            <Link to={ROUTES.SCHOOLS.CREATE}>
              <Button leftIcon={<Plus className="h-4 w-4" />}>{t('schools.createSchool')}</Button>
            </Link>
          ) : undefined
        }
      />

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
          options={statusOptions}
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
                <Card className="hover:shadow-soft-md transition-all duration-200 cursor-pointer h-full hover:border-primary-200 dark:hover:border-primary-500/30">
                  <CardContent className="py-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
                        {school.logoUrl ? (
                          <img src={school.logoUrl} alt={school.name} className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <School className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <Badge variant={statusBadgeVariant(school.status)} size="sm">
                        {t(STATUS_KEY_MAP[school.status])}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-text-primary">{school.name}</h3>
                    <p className="mt-1 text-sm text-text-muted">{school.code}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>{school.city}</span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {format(new Date(school.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
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
