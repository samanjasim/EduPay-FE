import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Textarea, Modal, ModalFooter } from '@/components/ui';
import { useFeeStructure, useUpdateFeeStructure } from '../api';
import { useFeeTypes } from '@/features/fee-types/api';
import { useAcademicYears } from '@/features/academic-years/api';
import { useGrades } from '@/features/grades/api';
import {
  createFeeStructureSchema,
  type CreateFeeStructureFormData,
} from '@/lib/validation';
import { Spinner } from '@/components/ui';

const FREQUENCY_OPTIONS = [
  { value: 'OneTime', labelKey: 'feeStructures.freq_OneTime' },
  { value: 'Monthly', labelKey: 'feeStructures.freq_Monthly' },
  { value: 'Quarterly', labelKey: 'feeStructures.freq_Quarterly' },
  { value: 'Semester', labelKey: 'feeStructures.freq_Semester' },
  { value: 'Annual', labelKey: 'feeStructures.freq_Annual' },
];

const CURRENCY_OPTIONS = [
  { value: 'IQD', label: 'IQD' },
  { value: 'USD', label: 'USD' },
];

interface EditFeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeStructureId: string;
}

export function EditFeeStructureModal({ isOpen, onClose, feeStructureId }: EditFeeStructureModalProps) {
  const { t } = useTranslation();
  const { data: feeStructure, isLoading: isLoadingDetail } = useFeeStructure(feeStructureId);
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
  const allGrades = gradesData?.data ?? [];
  const gradeOptions = [
    { value: '', label: t('feeStructures.allGrades') },
    ...allGrades.map((g) => ({ value: g.id, label: g.name })),
  ];

  const frequencyOptions = FREQUENCY_OPTIONS.map((f) => ({
    value: f.value,
    label: t(f.labelKey),
  }));

  if (isLoadingDetail || !feeStructure) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('feeStructures.editFeeStructure')} size="lg">
        <div className="flex justify-center py-12"><Spinner /></div>
      </Modal>
    );
  }

  return (
    <EditFeeStructureForm
      feeStructure={feeStructure} onClose={onClose}
      updateFeeStructure={updateFeeStructure} isPending={isPending}
      feeTypeOptions={feeTypeOptions} academicYearOptions={academicYearOptions}
      gradeOptions={gradeOptions} allGrades={allGrades} frequencyOptions={frequencyOptions}
    />
  );
}

function EditFeeStructureForm({ feeStructure, onClose, updateFeeStructure, isPending, feeTypeOptions, academicYearOptions, gradeOptions, allGrades, frequencyOptions }: {
  feeStructure: { id: string; name: string; description: string | null; feeTypeId: string; amount: number; currency: string; academicYearId: string; frequency: 'OneTime' | 'Monthly' | 'Quarterly' | 'Semester' | 'Annual'; applicableGradeId: string | null; applicableSectionId: string | null; dueDate: string; lateFeePercentage: number };
  onClose: () => void;
  updateFeeStructure: (args: { id: string; data: CreateFeeStructureFormData }, opts: { onSuccess: () => void }) => void;
  isPending: boolean;
  feeTypeOptions: { value: string; label: string }[];
  academicYearOptions: { value: string; label: string }[];
  gradeOptions: { value: string; label: string }[];
  allGrades: { id: string; sections?: { id: string; name: string; isActive: boolean }[] }[];
  frequencyOptions: { value: string; label: string }[];
}) {
  const { t } = useTranslation();
  const {
    register, handleSubmit, control, watch, formState: { errors },
  } = useForm<CreateFeeStructureFormData>({
    resolver: zodResolver(createFeeStructureSchema),
    defaultValues: {
      name: feeStructure.name,
      description: feeStructure.description,
      feeTypeId: feeStructure.feeTypeId ?? '',
      amount: feeStructure.amount,
      currency: feeStructure.currency ?? 'IQD',
      academicYearId: feeStructure.academicYearId ?? '',
      frequency: feeStructure.frequency ?? 'OneTime',
      applicableGradeId: feeStructure.applicableGradeId ?? null,
      applicableSectionId: feeStructure.applicableSectionId ?? null,
      dueDate: feeStructure.dueDate ?? '',
      lateFeePercentage: feeStructure.lateFeePercentage ?? 0,
    },
  });

  const selectedGradeId = watch('applicableGradeId');
  const selectedGrade = allGrades.find((g) => g.id === selectedGradeId);
  const sectionOptions = [
    { value: '', label: t('feeStructures.allSections') },
    ...(selectedGrade?.sections ?? [])
      .filter((s) => s.isActive)
      .map((s) => ({ value: s.id, label: s.name })),
  ];

  const onSubmit = (data: CreateFeeStructureFormData) => {
    updateFeeStructure({ id: feeStructure.id, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen onClose={onClose} title={t('feeStructures.editFeeStructure')} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('feeStructures.name')} error={errors.name?.message} {...register('name')} />
          <Textarea label={t('feeStructures.description')} rows={2} error={errors.description?.message} {...register('description')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller name="feeTypeId" control={control} render={({ field }) => (
            <Select label={t('feeStructures.feeType')} options={feeTypeOptions} value={field.value} onChange={field.onChange} error={errors.feeTypeId?.message} />
          )} />
          <Controller name="academicYearId" control={control} render={({ field }) => (
            <Select label={t('feeStructures.academicYear')} options={academicYearOptions} value={field.value} onChange={field.onChange} error={errors.academicYearId?.message} />
          )} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input label={t('feeStructures.amount')} type="number" step="0.01" error={errors.amount?.message} {...register('amount', { valueAsNumber: true })} />
          <Controller name="currency" control={control} render={({ field }) => (
            <Select label={t('feeStructures.currency')} options={CURRENCY_OPTIONS} value={field.value} onChange={field.onChange} />
          )} />
          <Controller name="frequency" control={control} render={({ field }) => (
            <Select label={t('feeStructures.frequency')} options={frequencyOptions} value={field.value} onChange={field.onChange} />
          )} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller name="applicableGradeId" control={control} render={({ field }) => (
            <Select label={t('feeStructures.grade')} options={gradeOptions} value={field.value ?? ''} onChange={(v) => field.onChange(v || null)} />
          )} />
          <Controller name="applicableSectionId" control={control} render={({ field }) => (
            <Select label={t('feeStructures.section')} options={sectionOptions} value={field.value ?? ''} onChange={(v) => field.onChange(v || null)} disabled={!selectedGradeId} />
          )} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('feeStructures.dueDate')} type="date" error={errors.dueDate?.message} {...register('dueDate')} />
          <Input label={t('feeStructures.lateFeePercentage')} type="number" step="0.01" min="0" max="100" error={errors.lateFeePercentage?.message} {...register('lateFeePercentage', { valueAsNumber: true })} />
        </div>

        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" isLoading={isPending}>{t('common.save')}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
