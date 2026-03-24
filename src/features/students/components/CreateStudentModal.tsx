import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Modal, ModalFooter } from '@/components/ui';
import { useCreateStudent } from '../api';
import { useGrades, useGrade } from '@/features/grades/api';
import { useAcademicYears } from '@/features/academic-years/api';
import {
  createStudentSchema,
  type CreateStudentFormData,
} from '@/lib/validation';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStudentModal({ isOpen, onClose }: CreateStudentModalProps) {
  const { t } = useTranslation();
  const { mutate: createStudent, isPending } = useCreateStudent();

  const {
    register, handleSubmit, watch, setValue, formState: { errors },
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      fullNameAr: '', fullNameEn: '', nationalId: '', studentCode: '',
      gradeId: '', sectionId: '', dateOfBirth: '', gender: undefined,
      enrollmentAcademicYearId: '',
    },
  });

  const selectedGradeId = watch('gradeId');

  // Grade dropdown
  const { data: gradesData } = useGrades({ isActive: true, pageSize: 100 });
  const gradeOptions = useMemo(() =>
    (gradesData?.data ?? []).map((g) => ({ value: g.id, label: g.name })),
    [gradesData]
  );

  // Section dropdown (depends on grade)
  const { data: gradeDetail } = useGrade(selectedGradeId);
  const sectionOptions = useMemo(() => {
    const sections = gradeDetail?.sections?.filter((s) => s.isActive) ?? [];
    return [
      { value: '', label: `— ${t('students.noSection')} —` },
      ...sections.map((s) => ({
        value: s.id,
        label: s.capacity ? `${s.name} (${s.capacity})` : s.name,
      })),
    ];
  }, [gradeDetail, t]);

  // Reset section when grade changes
  useEffect(() => {
    setValue('sectionId', '');
  }, [selectedGradeId, setValue]);

  // Academic year dropdown
  const { data: ayData } = useAcademicYears();
  const academicYearOptions = useMemo(() =>
    (ayData?.data ?? []).map((ay) => ({ value: ay.id, label: ay.label })),
    [ayData]
  );

  const onSubmit = (data: CreateStudentFormData) => {
    const payload = {
      ...data,
      nationalId: data.nationalId || undefined,
      sectionId: data.sectionId || undefined,
    };
    createStudent(payload, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('students.addStudent')} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('students.fullNameAr')}
            error={errors.fullNameAr?.message}
            dir="rtl"
            {...register('fullNameAr')}
          />
          <Input
            label={t('students.fullNameEn')}
            error={errors.fullNameEn?.message}
            {...register('fullNameEn')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('students.studentCode')}
            error={errors.studentCode?.message}
            {...register('studentCode')}
          />
          <Input
            label={t('students.nationalId')}
            error={errors.nationalId?.message}
            {...register('nationalId')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('students.dateOfBirth')}
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('students.gender')}
            </label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                <input type="radio" value="Male" className="accent-primary-600" {...register('gender')} />
                {t('students.male')}
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                <input type="radio" value="Female" className="accent-primary-600" {...register('gender')} />
                {t('students.female')}
              </label>
            </div>
            {errors.gender?.message && (
              <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('students.grade')}
            options={gradeOptions}
            value={selectedGradeId}
            onChange={(v) => setValue('gradeId', v)}
            error={errors.gradeId?.message}
            placeholder={t('students.selectGrade')}
          />
          <Select
            label={t('students.section')}
            options={sectionOptions}
            value={watch('sectionId') ?? ''}
            onChange={(v) => setValue('sectionId', v)}
            error={errors.sectionId?.message}
            placeholder={t('students.selectSection')}
            disabled={!selectedGradeId}
          />
        </div>

        <Select
          label={t('students.academicYear')}
          options={academicYearOptions}
          value={watch('enrollmentAcademicYearId')}
          onChange={(v) => setValue('enrollmentAcademicYearId', v)}
          error={errors.enrollmentAcademicYearId?.message}
          placeholder={t('students.selectAcademicYear')}
        />

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
