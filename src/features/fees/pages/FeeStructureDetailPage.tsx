import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Receipt, Pencil, Trash2, CheckCircle, Archive, Zap,
} from 'lucide-react';
import {
  Card, CardContent,
  Badge, Button, Spinner, Input, Select, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import {
  useFeeStructure,
  useUpdateFeeStructure,
  useDeleteFeeStructure,
  useUpdateFeeStructureStatus,
  useGenerateFeeInstances,
} from '../api';
import { useFeeTypes } from '@/features/fee-types/api';
import { useAcademicYears } from '@/features/academic-years/api';
import { useGrades } from '@/features/grades/api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import {
  createFeeStructureSchema,
  type CreateFeeStructureFormData,
} from '@/lib/validation';
import { format } from 'date-fns';
import type { FeeStructureDetailDto, FeeStructureStatus } from '@/types';

const STATUS_BADGE_VARIANT: Record<FeeStructureStatus, 'default' | 'success' | 'warning'> = {
  Draft: 'default',
  Active: 'success',
  Archived: 'warning',
};

const FREQUENCY_OPTIONS = [
  { value: 'OneTime', labelKey: 'feeStructures.freq_OneTime' },
  { value: 'Monthly', labelKey: 'feeStructures.freq_Monthly' },
  { value: 'Quarterly', labelKey: 'feeStructures.freq_Quarterly' },
  { value: 'Semester', labelKey: 'feeStructures.freq_Semester' },
  { value: 'Annual', labelKey: 'feeStructures.freq_Annual' },
];

export default function FeeStructureDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { data: feeStructure, isLoading } = useFeeStructure(id!);

  const { mutate: deleteMutation, isPending: isDeleting } = useDeleteFeeStructure();
  const { mutate: statusMutation, isPending: isUpdatingStatus } = useUpdateFeeStructureStatus();
  const { mutate: generateMutation, isPending: isGenerating } = useGenerateFeeInstances();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusAction, setStatusAction] = useState<FeeStructureStatus | null>(null);

  const canUpdate = hasPermission(PERMISSIONS.Fees.Update);
  const canDelete = hasPermission(PERMISSIONS.Fees.Delete);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!feeStructure) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const handleDelete = () => {
    deleteMutation(id!, {
      onSuccess: () => navigate(ROUTES.FEE_STRUCTURES.LIST),
    });
  };

  const handleStatusChange = () => {
    if (!statusAction) return;
    statusMutation(
      { id: id!, data: { status: statusAction } },
      { onSuccess: () => setStatusAction(null) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.FEE_STRUCTURES.LIST}
        backLabel={t('feeStructures.backToList')}
      />

      {/* Header Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <Receipt className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-text-primary">{feeStructure.name}</h1>
              {feeStructure.description && (
                <p className="mt-1 text-text-secondary">{feeStructure.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={STATUS_BADGE_VARIANT[feeStructure.status]}>
                {t(`feeStructures.${feeStructure.status.toLowerCase()}`)}
              </Badge>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoField label={t('feeStructures.feeType')}>{feeStructure.feeTypeName}</InfoField>
            <InfoField label={t('feeStructures.amount')}>
              {feeStructure.amount.toLocaleString()} {feeStructure.currency}
            </InfoField>
            <InfoField label={t('feeStructures.academicYear')}>{feeStructure.academicYearName}</InfoField>
            <InfoField label={t('feeStructures.frequency')}>
              {t(`feeStructures.freq_${feeStructure.frequency}`)}
            </InfoField>
            <InfoField label={t('feeStructures.grade')}>
              {feeStructure.gradeName ?? t('feeStructures.allGrades')}
            </InfoField>
            <InfoField label={t('feeStructures.section')}>
              {feeStructure.sectionName ?? '—'}
            </InfoField>
            <InfoField label={t('feeStructures.dueDate')}>
              {format(new Date(feeStructure.dueDate), 'MMMM d, yyyy')}
            </InfoField>
            <InfoField label={t('feeStructures.lateFeePercentage')}>
              {feeStructure.lateFeePercentage}%
            </InfoField>
            <InfoField label={t('common.createdAt')}>
              {format(new Date(feeStructure.createdAt), 'MMMM d, yyyy')}
            </InfoField>
            {feeStructure.modifiedAt && (
              <InfoField label={t('feeStructures.modifiedAt')}>
                {format(new Date(feeStructure.modifiedAt), 'MMMM d, yyyy')}
              </InfoField>
            )}
          </div>

          {/* Actions */}
          {(canUpdate || canDelete) && (
            <div className="flex items-center gap-2 border-t border-border pt-4 flex-wrap">
              {canUpdate && feeStructure.status === 'Draft' && (
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
                    variant="secondary"
                    size="sm"
                    onClick={() => setStatusAction('Active')}
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    {t('feeStructures.activate')}
                  </Button>
                </>
              )}
              {canUpdate && feeStructure.status === 'Active' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => generateMutation(feeStructure.id)}
                    leftIcon={<Zap className="h-4 w-4" />}
                    isLoading={isGenerating}
                  >
                    {t('feeStructures.generateFees')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setStatusAction('Archived')}
                    leftIcon={<Archive className="h-4 w-4" />}
                  >
                    {t('feeStructures.archive')}
                  </Button>
                </>
              )}
              {canDelete && feeStructure.status === 'Draft' && (
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

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('feeStructures.deleteFeeStructure')}
        description={t('feeStructures.deleteConfirmation', { name: feeStructure.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Status Change Confirm */}
      <ConfirmModal
        isOpen={!!statusAction}
        onClose={() => setStatusAction(null)}
        onConfirm={handleStatusChange}
        title={statusAction === 'Active' ? t('feeStructures.activate') : t('feeStructures.archive')}
        description={
          statusAction === 'Active'
            ? t('feeStructures.activateConfirmation', { name: feeStructure.name })
            : t('feeStructures.archiveConfirmation', { name: feeStructure.name })
        }
        confirmLabel={statusAction === 'Active' ? t('feeStructures.activate') : t('feeStructures.archive')}
        cancelLabel={t('common.cancel')}
        variant={statusAction === 'Active' ? 'primary' : 'danger'}
        isLoading={isUpdatingStatus}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <EditFeeStructureModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          feeStructure={feeStructure}
        />
      )}
    </div>
  );
}

/* ─── Edit Fee Structure Modal ─── */

function EditFeeStructureModal({
  isOpen,
  onClose,
  feeStructure,
}: {
  isOpen: boolean;
  onClose: () => void;
  feeStructure: FeeStructureDetailDto;
}) {
  const { t } = useTranslation();
  const { mutate: updateFeeStructure, isPending } = useUpdateFeeStructure();

  const { data: feeTypesData } = useFeeTypes({ pageSize: 100 });
  const feeTypeOptions = (feeTypesData?.data ?? [])
    .filter((ft) => ft.isActive)
    .map((ft) => ({ value: ft.id, label: ft.name }));

  const { data: academicYearsData } = useAcademicYears({ pageSize: 100 });
  const academicYearOptions = (academicYearsData?.data ?? []).map((ay) => ({
    value: ay.id,
    label: ay.label,
  }));

  const { data: gradesData } = useGrades({ pageSize: 100 });
  const gradeOptions = [
    { value: '', label: t('feeStructures.allGrades') },
    ...((gradesData?.data ?? []).map((g) => ({ value: g.id, label: g.name }))),
  ];

  const frequencyOptions = FREQUENCY_OPTIONS.map((f) => ({
    value: f.value,
    label: t(f.labelKey),
  }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateFeeStructureFormData>({
    resolver: zodResolver(createFeeStructureSchema),
    defaultValues: {
      name: feeStructure.name,
      description: feeStructure.description,
      feeTypeId: feeStructure.feeTypeId,
      amount: feeStructure.amount,
      currency: feeStructure.currency,
      academicYearId: feeStructure.academicYearId,
      frequency: feeStructure.frequency,
      applicableGradeId: feeStructure.applicableGradeId,
      applicableSectionId: feeStructure.applicableSectionId,
      dueDate: feeStructure.dueDate.split('T')[0],
      lateFeePercentage: feeStructure.lateFeePercentage,
    },
  });

  const onSubmit = (data: CreateFeeStructureFormData) => {
    updateFeeStructure(
      { id: feeStructure.id, data },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('feeStructures.editFeeStructure')} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('feeStructures.name')}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label={t('feeStructures.description')}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="feeTypeId"
            control={control}
            render={({ field }) => (
              <Select
                label={t('feeStructures.feeType')}
                options={feeTypeOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.feeTypeId?.message}
              />
            )}
          />
          <Controller
            name="academicYearId"
            control={control}
            render={({ field }) => (
              <Select
                label={t('feeStructures.academicYear')}
                options={academicYearOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.academicYearId?.message}
              />
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label={t('feeStructures.amount')}
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
          <Input
            label={t('feeStructures.currency')}
            error={errors.currency?.message}
            {...register('currency')}
          />
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <Select
                label={t('feeStructures.frequency')}
                options={frequencyOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.frequency?.message}
              />
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="applicableGradeId"
            control={control}
            render={({ field }) => (
              <Select
                label={t('feeStructures.grade')}
                options={gradeOptions}
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v || null)}
              />
            )}
          />
          <Input
            label={t('feeStructures.dueDate')}
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>

        <Input
          label={t('feeStructures.lateFeePercentage')}
          type="number"
          step="0.01"
          error={errors.lateFeePercentage?.message}
          {...register('lateFeePercentage', { valueAsNumber: true })}
          className="sm:max-w-[200px]"
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
