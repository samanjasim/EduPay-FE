import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarRange, Pencil, Trash2, Play, CheckCircle2, Star, Link2, Search, Plus,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Spinner, Input, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import {
  useAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  useActivateAcademicYear,
  useCompleteAcademicYear,
  useSetCurrentAcademicYear,
  useLinkSchool,
} from '../api';
import { useSchools } from '@/features/schools/api';
import { usePermissions, useDebounce } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import {
  updateAcademicYearSchema,
  type UpdateAcademicYearFormData,
} from '@/lib/validation';
import { format } from 'date-fns';
import type { AcademicYearStatus } from '@/types';

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

export default function AcademicYearDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { data: academicYear, isLoading } = useAcademicYear(id!);
  const { mutate: deleteAcademicYear, isPending: isDeleting } = useDeleteAcademicYear();
  const { mutate: activateAcademicYear, isPending: isActivating } = useActivateAcademicYear();
  const { mutate: completeAcademicYear, isPending: isCompleting } = useCompleteAcademicYear();
  const { mutate: setCurrentAcademicYear, isPending: isSettingCurrent } = useSetCurrentAcademicYear();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSetCurrentModal, setShowSetCurrentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkSchoolModal, setShowLinkSchoolModal] = useState(false);

  const canUpdate = hasPermission(PERMISSIONS.AcademicYears.Update);
  const canDelete = hasPermission(PERMISSIONS.AcademicYears.Delete);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!academicYear) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const isPlanned = academicYear.status === 'Planned';
  const isActive = academicYear.status === 'Active';

  const handleDelete = () => {
    deleteAcademicYear(id!, {
      onSuccess: () => navigate(ROUTES.ACADEMIC_YEARS.LIST),
    });
  };

  const handleActivate = () => {
    activateAcademicYear(id!, {
      onSuccess: () => setShowActivateModal(false),
    });
  };

  const handleComplete = () => {
    completeAcademicYear(id!, {
      onSuccess: () => setShowCompleteModal(false),
    });
  };

  const handleSetCurrent = () => {
    setCurrentAcademicYear(id!, {
      onSuccess: () => setShowSetCurrentModal(false),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.ACADEMIC_YEARS.LIST}
        backLabel={t('academicYears.backToAcademicYears')}
      />

      {/* Header Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <CalendarRange className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-text-primary">{academicYear.label}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <Badge variant={statusBadgeVariant(academicYear.status)}>
                {t(STATUS_KEY_MAP[academicYear.status])}
              </Badge>
              {academicYear.isCurrent && (
                <Badge variant="primary">{t('academicYears.current')}</Badge>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoField label={t('academicYears.startYear')}>{academicYear.startYear}</InfoField>
            <InfoField label={t('academicYears.endYear')}>{academicYear.endYear}</InfoField>
            <InfoField label={t('common.createdAt')}>
              {format(new Date(academicYear.createdAt), 'MMMM d, yyyy')}
            </InfoField>
            {academicYear.modifiedAt && (
              <InfoField label={t('academicYears.modifiedAt')}>
                {format(new Date(academicYear.modifiedAt), 'MMMM d, yyyy')}
              </InfoField>
            )}
          </div>

          {/* Actions */}
          {canUpdate && (
            <div className="flex items-center gap-2 border-t border-border pt-4 flex-wrap">
              {isPlanned && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    leftIcon={<Pencil className="h-4 w-4" />}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowActivateModal(true)}
                    leftIcon={<Play className="h-4 w-4" />}
                  >
                    {t('academicYears.activate')}
                  </Button>
                </>
              )}
              {isActive && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCompleteModal(true)}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  {t('academicYears.complete')}
                </Button>
              )}
              {!academicYear.isCurrent && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSetCurrentModal(true)}
                  leftIcon={<Star className="h-4 w-4" />}
                >
                  {t('academicYears.setCurrent')}
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  {t('common.delete')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Schools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {t('academicYears.linkedSchools')} ({academicYear.linkedSchools.length})
          </CardTitle>
          {canUpdate && (
            <Button
              size="sm"
              onClick={() => setShowLinkSchoolModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t('academicYears.linkSchool')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {academicYear.linkedSchools.length === 0 ? (
            <p className="py-4 text-sm text-text-muted">{t('academicYears.noLinkedSchools')}</p>
          ) : (
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('academicYears.schoolName')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('academicYears.schoolCode')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('academicYears.isCurrent')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('academicYears.schoolStatus')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('academicYears.startedAt')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('academicYears.closedAt')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {academicYear.linkedSchools.map((school) => (
                    <tr key={school.schoolId} className="hover:bg-hover/50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-text-primary">{school.schoolName}</td>
                      <td className="px-4 py-3.5 text-text-secondary">{school.schoolCode}</td>
                      <td className="px-4 py-3.5">
                        {school.isCurrent ? (
                          <Badge variant="primary" size="sm">{t('academicYears.current')}</Badge>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={school.status === 'Active' ? 'success' : 'default'}
                          size="sm"
                        >
                          {school.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {school.startedAt ? format(new Date(school.startedAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {school.closedAt ? format(new Date(school.closedAt), 'MMM d, yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('academicYears.deleteAcademicYear')}
        description={t('academicYears.deleteConfirmation', { label: academicYear.label })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={handleActivate}
        title={t('academicYears.activate')}
        description={t('academicYears.activateConfirmation', { label: academicYear.label })}
        confirmLabel={t('academicYears.activate')}
        cancelLabel={t('common.cancel')}
        variant="primary"
        isLoading={isActivating}
      />

      <ConfirmModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleComplete}
        title={t('academicYears.complete')}
        description={t('academicYears.completeConfirmation', { label: academicYear.label })}
        confirmLabel={t('academicYears.complete')}
        cancelLabel={t('common.cancel')}
        variant="primary"
        isLoading={isCompleting}
      />

      <ConfirmModal
        isOpen={showSetCurrentModal}
        onClose={() => setShowSetCurrentModal(false)}
        onConfirm={handleSetCurrent}
        title={t('academicYears.setCurrent')}
        description={t('academicYears.setCurrentConfirmation', { label: academicYear.label })}
        confirmLabel={t('academicYears.setCurrent')}
        cancelLabel={t('common.cancel')}
        variant="primary"
        isLoading={isSettingCurrent}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <EditAcademicYearModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          academicYearId={id!}
          defaultValues={{
            startYear: academicYear.startYear,
            endYear: academicYear.endYear,
          }}
        />
      )}

      {/* Link School Modal */}
      {showLinkSchoolModal && (
        <LinkSchoolModal
          isOpen={showLinkSchoolModal}
          onClose={() => setShowLinkSchoolModal(false)}
          academicYearId={id!}
          linkedSchoolIds={academicYear.linkedSchools.map((s) => s.schoolId)}
        />
      )}
    </div>
  );
}

/* ─── Edit Academic Year Modal ─── */

function EditAcademicYearModal({
  isOpen,
  onClose,
  academicYearId,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  academicYearId: string;
  defaultValues: UpdateAcademicYearFormData;
}) {
  const { t } = useTranslation();
  const { mutate: updateAcademicYear, isPending } = useUpdateAcademicYear();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateAcademicYearFormData>({
    resolver: zodResolver(updateAcademicYearSchema),
    defaultValues,
  });

  const startYear = watch('startYear');
  useEffect(() => {
    if (startYear) {
      setValue('endYear', Number(startYear) + 1);
    }
  }, [startYear, setValue]);

  const onSubmit = (data: UpdateAcademicYearFormData) => {
    updateAcademicYear(
      { id: academicYearId, data },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('academicYears.editAcademicYear')} size="sm">
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

/* ─── Link School Modal ─── */

function LinkSchoolModal({
  isOpen,
  onClose,
  academicYearId,
  linkedSchoolIds,
}: {
  isOpen: boolean;
  onClose: () => void;
  academicYearId: string;
  linkedSchoolIds: string[];
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [isCurrent, setIsCurrent] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { mutate: linkSchool, isPending } = useLinkSchool();
  const { data: schoolsData, isLoading: isLoadingSchools } = useSchools();

  const schools = schoolsData?.data ?? [];

  const availableSchools = useMemo(() => {
    const linked = new Set(linkedSchoolIds);
    let filtered = schools.filter((s) => !linked.has(s.id));
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.code.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [schools, linkedSchoolIds, debouncedSearch]);

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  const handleSubmit = () => {
    if (!selectedSchoolId) return;
    linkSchool(
      { academicYearId, data: { schoolId: selectedSchoolId, isCurrent } },
      {
        onSuccess: () => {
          setSearchTerm('');
          setSelectedSchoolId('');
          setIsCurrent(true);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedSchoolId('');
    setIsCurrent(true);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('academicYears.linkSchool')} size="md">
      <div className="space-y-4">
        {/* School search */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('academicYears.selectSchool')}
          </label>
          <Input
            placeholder={t('academicYears.searchSchools')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedSchoolId('');
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
          {/* School dropdown list */}
          {searchTerm && !selectedSchoolId && (
            <div className="mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-soft-lg">
              {isLoadingSchools ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : availableSchools.length === 0 ? (
                <p className="px-4 py-3 text-sm text-text-muted">{t('academicYears.noSchoolsFound')}</p>
              ) : (
                availableSchools.slice(0, 10).map((school) => (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => {
                      setSelectedSchoolId(school.id);
                      setSearchTerm(school.name);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-hover text-start"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                      {school.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary truncate">{school.name}</p>
                      <p className="text-xs text-text-muted truncate">{school.code}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          {/* Selected school chip */}
          {selectedSchool && (
            <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2.5 dark:border-primary-500/30 dark:bg-primary-500/10">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-200 text-xs font-medium text-primary-700 dark:bg-primary-500/30 dark:text-primary-300">
                {selectedSchool.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {selectedSchool.name}
                </span>
                <span className="mx-1.5 text-xs text-primary-400">·</span>
                <span className="text-xs text-primary-500">{selectedSchool.code}</span>
              </div>
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="rounded border-border accent-primary-600"
          />
          {t('academicYears.isCurrent')}
        </label>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} isLoading={isPending} disabled={!selectedSchoolId}>
          {t('academicYears.linkSchool')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
