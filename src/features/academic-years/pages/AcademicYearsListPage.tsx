import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, CalendarRange, Search } from 'lucide-react';
import {
  Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useAcademicYears, useCreateAcademicYear } from '../api';
import { useDebounce, usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { createAcademicYearSchema, type CreateAcademicYearFormData } from '@/lib/validation';
import { format } from 'date-fns';
import type { AcademicYearStatus, AcademicYearListParams } from '@/types';

const statusBadgeVariant = (status: AcademicYearStatus) => {
  const map: Record<AcademicYearStatus, 'warning' | 'success' | 'default'> = {
    Planned: 'warning',
    Active: 'success',
    Completed: 'default',
  };
  return map[status];
};

const STATUS_KEY_MAP: Record<AcademicYearStatus, string> = {
  Planned: 'academicYears.statusPlanned',
  Active: 'academicYears.statusActive',
  Completed: 'academicYears.statusCompleted',
};

const PAGE_SIZE = 10;

export default function AcademicYearsListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const statusOptions = [
    { value: '', label: t('academicYears.allStatuses') },
    { value: 'Planned', label: t('academicYears.statusPlanned') },
    { value: 'Active', label: t('academicYears.statusActive') },
    { value: 'Completed', label: t('academicYears.statusCompleted') },
  ];

  const params: AcademicYearListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as AcademicYearStatus }),
  };

  const { data, isLoading } = useAcademicYears(params);
  const academicYears = data?.data ?? [];
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
        title={t('academicYears.title')}
        subtitle={t('academicYears.allAcademicYears')}
        actions={
          hasPermission(PERMISSIONS.AcademicYears.Create) ? (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              {t('academicYears.createAcademicYear')}
            </Button>
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
          placeholder={t('academicYears.filterByStatus')}
          className="sm:max-w-[200px]"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : academicYears.length === 0 ? (
        <EmptyState icon={CalendarRange} title={t('common.noResults')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('academicYears.label')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.status')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('academicYears.isCurrent')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('academicYears.linkedSchools')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.createdAt')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {academicYears.map((ay) => (
                      <tr key={ay.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <Link
                            to={ROUTES.ACADEMIC_YEARS.getDetail(ay.id)}
                            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            {ay.label}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={statusBadgeVariant(ay.status)} size="sm">
                            {t(STATUS_KEY_MAP[ay.status])}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {ay.isCurrent ? (
                            <Badge variant="primary" size="sm">{t('academicYears.current')}</Badge>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {ay.linkedSchoolCount}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">
                          {format(new Date(ay.createdAt), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAcademicYearModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

/* ─── Create Academic Year Modal ─── */

function CreateAcademicYearModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { mutate: createAcademicYear, isPending } = useCreateAcademicYear();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAcademicYearFormData>({
    resolver: zodResolver(createAcademicYearSchema),
    defaultValues: {
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 1,
      isCurrent: false,
    },
  });

  const startYear = watch('startYear');
  useEffect(() => {
    if (startYear) {
      setValue('endYear', Number(startYear) + 1);
    }
  }, [startYear, setValue]);

  const onSubmit = (data: CreateAcademicYearFormData) => {
    createAcademicYear(data, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('academicYears.createAcademicYear')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('academicYears.startYear')}
            type="number"
            error={errors.startYear?.message}
            {...register('startYear', { valueAsNumber: true })}
          />
          <Input
            label={t('academicYears.endYear')}
            type="number"
            error={errors.endYear?.message}
            {...register('endYear', { valueAsNumber: true })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="rounded border-border accent-primary-600"
            {...register('isCurrent')}
          />
          {t('academicYears.isCurrent')}
        </label>
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('common.create')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
