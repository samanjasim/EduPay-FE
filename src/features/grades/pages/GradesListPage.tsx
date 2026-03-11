import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, GraduationCap, Search, Trash2, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, EmptyState, ConfirmModal } from '@/components/common';
import { useGrades, useCreateGrade, useUpdateGrade, useDeleteGrade, useToggleGradeStatus } from '../api';
import { useSchools } from '@/features/schools/api';
import { useDebounce, usePermissions } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useUIStore } from '@/stores/ui.store';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import {
  createGradeSchema, updateGradeSchema,
  type CreateGradeFormData, type UpdateGradeFormData,
} from '@/lib/validation';
import { format } from 'date-fns';
import type { GradeListParams, GradeSummaryDto } from '@/types';

const PAGE_SIZE = 10;

export default function GradesListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const user = useAuthStore((s) => s.user);
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  const setActiveSchoolId = useUIStore((s) => s.setActiveSchoolId);

  const isPlatformAdmin =
    user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editGrade, setEditGrade] = useState<GradeSummaryDto | null>(null);
  const [deleteGrade, setDeleteGrade] = useState<GradeSummaryDto | null>(null);
  const [toggleGrade, setToggleGrade] = useState<GradeSummaryDto | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch schools for the selector
  const { data: schoolsData } = useSchools({ pageSize: 100 });
  const schools = schoolsData?.data ?? [];

  // Build school name map for "All Schools" view
  const schoolNameMap = useMemo(() => {
    const map = new Map<string, string>();
    schools.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [schools]);

  const statusOptions = [
    { value: '', label: t('grades.allStatuses') },
    { value: 'true', label: t('grades.active') },
    { value: 'false', label: t('grades.inactive') },
  ];

  const schoolOptions = useMemo(() => {
    const opts = schools.map((s) => ({ value: s.id, label: s.name }));
    if (isPlatformAdmin) {
      opts.unshift({ value: '', label: t('grades.allSchools') });
    }
    return opts;
  }, [schools, isPlatformAdmin, t]);

  // Auto-select school for SchoolAdmin
  useEffect(() => {
    if (!isPlatformAdmin && schools.length > 0 && !activeSchoolId) {
      setActiveSchoolId(schools[0].id);
    }
  }, [isPlatformAdmin, schools, activeSchoolId, setActiveSchoolId]);

  const params: GradeListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter !== '' && { isActive: statusFilter === 'true' }),
  };

  const { data, isLoading } = useGrades(params);
  const grades = data?.data ?? [];
  const pagination = data?.pagination;

  const { mutate: deleteGradeMutation, isPending: isDeleting } = useDeleteGrade();
  const { mutate: toggleStatusMutation, isPending: isToggling } = useToggleGradeStatus();

  const showSchoolColumn = isPlatformAdmin && !activeSchoolId;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSchoolChange = (value: string) => {
    setActiveSchoolId(value || null);
    setPage(1);
  };

  const handleDelete = () => {
    if (!deleteGrade) return;
    deleteGradeMutation(deleteGrade.id, {
      onSuccess: () => setDeleteGrade(null),
    });
  };

  const handleToggleStatus = () => {
    if (!toggleGrade) return;
    toggleStatusMutation(
      { id: toggleGrade.id, data: { isActive: !toggleGrade.isActive } },
      { onSuccess: () => setToggleGrade(null) }
    );
  };

  const canCreate = hasPermission(PERMISSIONS.Grades.Create);
  const canUpdate = hasPermission(PERMISSIONS.Grades.Update);
  const canDelete = hasPermission(PERMISSIONS.Grades.Delete);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('grades.title')}
        subtitle={t('grades.allGrades')}
        actions={
          canCreate ? (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
              disabled={!activeSchoolId}
              title={!activeSchoolId ? t('grades.selectSchoolToCreate') : undefined}
            >
              {t('grades.createGrade')}
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {schoolOptions.length > 0 && (
          <Select
            options={schoolOptions}
            value={activeSchoolId ?? ''}
            onChange={handleSchoolChange}
            placeholder={t('grades.selectSchool')}
            className="sm:max-w-[250px]"
          />
        )}
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
          placeholder={t('grades.filterByStatus')}
          className="sm:max-w-[200px]"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : grades.length === 0 ? (
        <EmptyState icon={GraduationCap} title={t('common.noResults')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {showSchoolColumn && (
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('grades.school')}
                        </th>
                      )}
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('grades.name')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('grades.sortOrder')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.status')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('grades.sections')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.createdAt')}
                      </th>
                      {(canUpdate || canDelete) && (
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('common.actions')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-hover/50 transition-colors">
                        {showSchoolColumn && (
                          <td className="px-4 py-3.5 text-text-secondary">
                            {schoolNameMap.get(grade.schoolId) ?? grade.schoolId.slice(0, 8)}
                          </td>
                        )}
                        <td className="px-4 py-3.5">
                          <Link
                            to={ROUTES.GRADES.getDetail(grade.id)}
                            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            {grade.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {grade.sortOrder}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={grade.isActive ? 'success' : 'default'}
                            size="sm"
                          >
                            {grade.isActive ? t('grades.active') : t('grades.inactive')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {grade.sectionCount}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">
                          {format(new Date(grade.createdAt), 'MMM d, yyyy')}
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              {canUpdate && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditGrade(grade)}
                                    title={t('common.edit')}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setToggleGrade(grade)}
                                    title={grade.isActive ? t('grades.deactivate') : t('grades.activate')}
                                  >
                                    {grade.isActive ? (
                                      <ToggleRight className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <ToggleLeft className="h-4 w-4 text-text-muted" />
                                    )}
                                  </Button>
                                </>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteGrade(grade)}
                                  title={t('common.delete')}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
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
        <CreateGradeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editGrade && (
        <EditGradeModal
          isOpen={!!editGrade}
          onClose={() => setEditGrade(null)}
          gradeId={editGrade.id}
          defaultValues={{
            name: editGrade.name,
            sortOrder: editGrade.sortOrder,
          }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteGrade}
        onClose={() => setDeleteGrade(null)}
        onConfirm={handleDelete}
        title={t('grades.deleteGrade')}
        description={t('grades.deleteConfirmation', { name: deleteGrade?.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Toggle Status Confirm */}
      <ConfirmModal
        isOpen={!!toggleGrade}
        onClose={() => setToggleGrade(null)}
        onConfirm={handleToggleStatus}
        title={toggleGrade?.isActive ? t('grades.deactivate') : t('grades.activate')}
        description={
          toggleGrade?.isActive
            ? t('grades.deactivateConfirmation', { name: toggleGrade?.name })
            : t('grades.activateConfirmation', { name: toggleGrade?.name })
        }
        confirmLabel={toggleGrade?.isActive ? t('grades.deactivate') : t('grades.activate')}
        cancelLabel={t('common.cancel')}
        variant={toggleGrade?.isActive ? 'danger' : 'primary'}
        isLoading={isToggling}
      />
    </div>
  );
}

/* ─── Create Grade Modal ─── */

function CreateGradeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { mutate: createGrade, isPending } = useCreateGrade();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateGradeFormData>({
    resolver: zodResolver(createGradeSchema),
    defaultValues: {
      name: '',
      sortOrder: 0,
      sections: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });

  const onSubmit = (data: CreateGradeFormData) => {
    const payload = {
      ...data,
      sections: data.sections && data.sections.length > 0 ? data.sections : undefined,
    };
    createGrade(payload, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('grades.createGrade')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('grades.name')}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label={t('grades.sortOrder')}
            type="number"
            error={errors.sortOrder?.message}
            {...register('sortOrder', { valueAsNumber: true })}
          />
        </div>

        {/* Sections builder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">
              {t('grades.sections')}
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ name: '', capacity: null })}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              {t('grades.addSection')}
            </Button>
          </div>
          {fields.length > 0 && (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder={t('grades.sectionName')}
                      error={errors.sections?.[index]?.name?.message}
                      {...register(`sections.${index}.name`)}
                    />
                    <Input
                      placeholder={t('grades.capacity')}
                      type="number"
                      error={errors.sections?.[index]?.capacity?.message}
                      {...register(`sections.${index}.capacity`, {
                        setValueAs: (v: string) => (v === '' ? null : Number(v)),
                      })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="mt-1 shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

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

/* ─── Edit Grade Modal ─── */

export function EditGradeModal({
  isOpen,
  onClose,
  gradeId,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  gradeId: string;
  defaultValues: UpdateGradeFormData;
}) {
  const { t } = useTranslation();
  const { mutate: updateGrade, isPending } = useUpdateGrade();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateGradeFormData>({
    resolver: zodResolver(updateGradeSchema),
    defaultValues,
  });

  const onSubmit = (data: UpdateGradeFormData) => {
    updateGrade({ id: gradeId, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('grades.editGrade')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('grades.name')}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label={t('grades.sortOrder')}
          type="number"
          error={errors.sortOrder?.message}
          {...register('sortOrder', { valueAsNumber: true })}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
