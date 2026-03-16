import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, UserRoundSearch, Search, Pencil, Trash2, ArrowRightLeft, Eye, ShieldAlert } from 'lucide-react';
import {
  Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, EmptyState, ConfirmModal } from '@/components/common';
import {
  useStudents, useStudent, useCreateStudent, useUpdateStudent, useDeleteStudent, useChangeStudentStatus,
} from '../api';
import { useSchools } from '@/features/schools/api';
import { useGrades, useGrade } from '@/features/grades/api';
import { useAcademicYears } from '@/features/academic-years/api';
import { useDebounce, usePermissions } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useUIStore } from '@/stores/ui.store';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import {
  createStudentSchema, updateStudentSchema,
  type CreateStudentFormData, type UpdateStudentFormData,
} from '@/lib/validation';
import { format } from 'date-fns';
import type { StudentListParams, StudentSummaryDto, StudentStatus, Gender } from '@/types';

const STATUS_BADGE_MAP: Record<StudentStatus, 'success' | 'warning' | 'primary' | 'default' | 'error'> = {
  Active: 'success',
  Suspended: 'warning',
  Graduated: 'primary',
  Transferred: 'default',
  Withdrawn: 'error',
};

const PAGE_SIZE = 10;

export default function StudentsListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const user = useAuthStore((s) => s.user);
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  const setActiveSchoolId = useUIStore((s) => s.setActiveSchoolId);

  const isPlatformAdmin =
    user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentSummaryDto | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentSummaryDto | null>(null);
  const [statusStudent, setStatusStudent] = useState<StudentSummaryDto | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // School selector
  const { data: schoolsData } = useSchools({ pageSize: 100 });
  const schools = schoolsData?.data ?? [];
  const schoolNameMap = useMemo(() => {
    const map = new Map<string, string>();
    schools.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [schools]);

  const schoolOptions = useMemo(() => {
    const opts = schools.map((s) => ({ value: s.id, label: s.name }));
    if (isPlatformAdmin) {
      opts.unshift({ value: '', label: t('students.allSchools') });
    }
    return opts;
  }, [schools, isPlatformAdmin, t]);

  useEffect(() => {
    if (!isPlatformAdmin && schools.length > 0 && !activeSchoolId) {
      setActiveSchoolId(schools[0].id);
    }
  }, [isPlatformAdmin, schools, activeSchoolId, setActiveSchoolId]);

  // Grades for filter dropdown
  const { data: gradesData } = useGrades({ isActive: true, pageSize: 100 });
  const grades = gradesData?.data ?? [];
  const gradeOptions = useMemo(() => [
    { value: '', label: t('students.allGrades') },
    ...grades.map((g) => ({ value: g.id, label: g.name })),
  ], [grades, t]);

  // Sections for filter (from selected grade)
  const { data: selectedGradeDetail } = useGrade(gradeFilter);
  const sectionOptions = useMemo(() => {
    const sections = selectedGradeDetail?.sections?.filter((s) => s.isActive) ?? [];
    return [
      { value: '', label: t('students.allSections') },
      ...sections.map((s) => ({ value: s.id, label: s.name })),
    ];
  }, [selectedGradeDetail, t]);

  // Reset section when grade changes
  useEffect(() => {
    setSectionFilter('');
  }, [gradeFilter]);

  const statusOptions = [
    { value: '', label: t('students.allStatuses') },
    { value: 'Active', label: t('students.statusActive') },
    { value: 'Suspended', label: t('students.statusSuspended') },
    { value: 'Graduated', label: t('students.statusGraduated') },
    { value: 'Transferred', label: t('students.statusTransferred') },
    { value: 'Withdrawn', label: t('students.statusWithdrawn') },
  ];

  const genderOptions = [
    { value: '', label: t('students.allGenders') },
    { value: 'Male', label: t('students.male') },
    { value: 'Female', label: t('students.female') },
  ];

  const params: StudentListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as StudentStatus }),
    ...(genderFilter && { gender: genderFilter as Gender }),
    ...(gradeFilter && { gradeId: gradeFilter }),
    ...(sectionFilter && { sectionId: sectionFilter }),
  };

  const { data, isLoading } = useStudents(params);
  const students = data?.data ?? [];
  const pagination = data?.pagination;

  const { mutate: deleteStudentMutation, isPending: isDeleting } = useDeleteStudent();
  const showSchoolColumn = isPlatformAdmin && !activeSchoolId;
  const canCreate = hasPermission(PERMISSIONS.Students.Create);
  const canUpdate = hasPermission(PERMISSIONS.Students.Update);
  const canDelete = hasPermission(PERMISSIONS.Students.Delete);

  const handleSchoolChange = (value: string) => {
    setActiveSchoolId(value || null);
    setPage(1);
  };

  const handleDelete = () => {
    if (!deleteStudent) return;
    deleteStudentMutation(deleteStudent.id, {
      onSuccess: () => setDeleteStudent(null),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('students.title')}
        subtitle={t('students.allStudents')}
        actions={
          canCreate ? (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
              disabled={!activeSchoolId}
              title={!activeSchoolId ? t('students.selectSchoolToCreate') : undefined}
            >
              {t('students.addStudent')}
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {schoolOptions.length > 0 && (
          <Select
            options={schoolOptions}
            value={activeSchoolId ?? ''}
            onChange={handleSchoolChange}
            placeholder={t('students.selectSchool')}
            className="sm:max-w-[220px]"
          />
        )}
        <div className="sm:max-w-xs flex-1">
          <Input
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          options={gradeOptions}
          value={gradeFilter}
          onChange={(v) => { setGradeFilter(v); setPage(1); }}
          className="sm:max-w-[180px]"
        />
        <Select
          options={sectionOptions}
          value={sectionFilter}
          onChange={(v) => { setSectionFilter(v); setPage(1); }}
          className="sm:max-w-[160px]"
          disabled={!gradeFilter}
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          className="sm:max-w-[170px]"
        />
        <Select
          options={genderOptions}
          value={genderFilter}
          onChange={(v) => { setGenderFilter(v); setPage(1); }}
          className="sm:max-w-[150px]"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState icon={UserRoundSearch} title={t('common.noResults')} />
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
                          {t('students.school')}
                        </th>
                      )}
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('students.studentCode')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('students.name')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('students.gradeSection')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('students.gender')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.status')}
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
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-hover/50 transition-colors">
                        {showSchoolColumn && (
                          <td className="px-4 py-3.5 text-text-secondary">
                            {schoolNameMap.get(student.schoolId) ?? student.schoolId.slice(0, 8)}
                          </td>
                        )}
                        <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">
                          {student.studentCode}
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            to={ROUTES.STUDENTS.getDetail(student.id)}
                            className="block"
                          >
                            <span className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                              {student.fullNameEn}
                            </span>
                            <span className="block text-xs text-text-muted mt-0.5" dir="rtl">
                              {student.fullNameAr}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {student.gradeName}
                          {student.sectionName && (
                            <span className="text-text-muted"> / {student.sectionName}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {t(`students.${student.gender.toLowerCase()}`)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={STATUS_BADGE_MAP[student.status]} size="sm">
                            {t(`students.status${student.status}`)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">
                          {format(new Date(student.createdAt), 'MMM d, yyyy')}
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = ROUTES.STUDENTS.getDetail(student.id)}
                                title={t('students.viewDetail')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canUpdate && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditStudent(student)}
                                    title={t('common.edit')}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setStatusStudent(student)}
                                    title={t('students.changeStatus')}
                                  >
                                    <ArrowRightLeft className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteStudent(student)}
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
        <CreateStudentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editStudent && (
        <EditStudentModal
          isOpen={!!editStudent}
          onClose={() => setEditStudent(null)}
          studentId={editStudent.id}
        />
      )}

      {/* Change Status Modal */}
      {statusStudent && (
        <ChangeStatusModal
          isOpen={!!statusStudent}
          onClose={() => setStatusStudent(null)}
          student={statusStudent}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteStudent}
        onClose={() => setDeleteStudent(null)}
        onConfirm={handleDelete}
        title={t('students.deleteStudent')}
        description={t('students.deleteConfirmation', { name: deleteStudent?.fullNameEn })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

/* ─── Create Student Modal ─── */

function CreateStudentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
                <input
                  type="radio"
                  value="Male"
                  className="accent-primary-600"
                  {...register('gender')}
                />
                {t('students.male')}
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                <input
                  type="radio"
                  value="Female"
                  className="accent-primary-600"
                  {...register('gender')}
                />
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

/* ─── Edit Student Modal ─── */

function EditStudentModal({
  isOpen, onClose, studentId,
}: {
  isOpen: boolean; onClose: () => void; studentId: string;
}) {
  const { t } = useTranslation();
  const { data: student, isLoading: isLoadingStudent } = useStudent(studentId);
  const { mutate: updateStudent, isPending } = useUpdateStudent();

  const {
    register, handleSubmit, watch, setValue, reset, formState: { errors },
  } = useForm<UpdateStudentFormData>({
    resolver: zodResolver(updateStudentSchema),
  });

  // Populate form when student data loads
  useEffect(() => {
    if (student) {
      reset({
        fullNameAr: student.fullNameAr,
        fullNameEn: student.fullNameEn,
        nationalId: student.nationalId ?? '',
        studentCode: student.studentCode,
        gradeId: student.gradeId,
        sectionId: student.sectionId ?? '',
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
      });
    }
  }, [student, reset]);

  const selectedGradeId = watch('gradeId');

  // Grade dropdown
  const { data: gradesData } = useGrades({ isActive: true, pageSize: 100 });
  const gradeOptions = useMemo(() =>
    (gradesData?.data ?? []).map((g) => ({ value: g.id, label: g.name })),
    [gradesData]
  );

  // Section dropdown
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

  // Reset section when grade changes (only if user manually changed it)
  const [initialGradeId, setInitialGradeId] = useState('');
  useEffect(() => {
    if (student?.gradeId) setInitialGradeId(student.gradeId);
  }, [student?.gradeId]);

  useEffect(() => {
    if (selectedGradeId && selectedGradeId !== initialGradeId) {
      setValue('sectionId', '');
    }
  }, [selectedGradeId, initialGradeId, setValue]);

  const onSubmit = (data: UpdateStudentFormData) => {
    const payload = {
      ...data,
      nationalId: data.nationalId || undefined,
      sectionId: data.sectionId || undefined,
    };
    updateStudent({ id: studentId, data: payload }, { onSuccess: onClose });
  };

  if (isLoadingStudent) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('students.editStudent')} size="lg">
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('students.editStudent')} size="lg">
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
                <input
                  type="radio"
                  value="Male"
                  className="accent-primary-600"
                  {...register('gender')}
                />
                {t('students.male')}
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                <input
                  type="radio"
                  value="Female"
                  className="accent-primary-600"
                  {...register('gender')}
                />
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

/* ─── Change Status Modal ─── */

const VALID_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  Active: ['Suspended', 'Graduated', 'Transferred', 'Withdrawn'],
  Suspended: ['Active'],
  Graduated: [],
  Transferred: [],
  Withdrawn: [],
};

const TERMINAL_STATUSES: StudentStatus[] = ['Graduated', 'Transferred', 'Withdrawn'];

function ChangeStatusModal({
  isOpen, onClose, student,
}: {
  isOpen: boolean; onClose: () => void; student: StudentSummaryDto;
}) {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: changeStatus, isPending } = useChangeStudentStatus();

  const validStatuses = VALID_TRANSITIONS[student.status] ?? [];
  const statusOptions = validStatuses.map((s) => ({
    value: s,
    label: t(`students.status${s}`),
  }));

  const isTerminal = TERMINAL_STATUSES.includes(selectedStatus as StudentStatus);

  const handleConfirm = () => {
    if (!selectedStatus) return;
    changeStatus(
      { id: student.id, data: { status: selectedStatus as StudentStatus } },
      {
        onSuccess: () => {
          setSelectedStatus('');
          setShowConfirm(false);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedStatus('');
    setShowConfirm(false);
    onClose();
  };

  if (validStatuses.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={t('students.changeStatus')} size="sm">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
            <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-text-secondary">
            {t('students.terminalStatusMessage', { status: t(`students.status${student.status}`) })}
          </p>
          <Badge variant={STATUS_BADGE_MAP[student.status]}>
            {t(`students.status${student.status}`)}
          </Badge>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={handleClose}>{t('common.close')}</Button>
        </ModalFooter>
      </Modal>
    );
  }

  if (showConfirm) {
    const confirmKey = selectedStatus === 'Active'
      ? 'students.reactivateConfirmation'
      : `students.${selectedStatus.toLowerCase()}Confirmation`;
    return (
      <ConfirmModal
        isOpen
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={t('students.changeStatus')}
        description={t(confirmKey, { name: student.fullNameEn })}
        confirmLabel={t(`students.status${selectedStatus}`)}
        cancelLabel={t('common.cancel')}
        variant={isTerminal ? 'danger' : 'primary'}
        isLoading={isPending}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('students.changeStatus')} size="sm">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('students.currentStatus')}
          </label>
          <Badge variant={STATUS_BADGE_MAP[student.status]}>
            {t(`students.status${student.status}`)}
          </Badge>
        </div>
        <Select
          label={t('students.newStatus')}
          options={statusOptions}
          value={selectedStatus}
          onChange={setSelectedStatus}
          placeholder={t('students.selectStatus')}
        />
        {isTerminal && selectedStatus && (
          <p className="text-xs text-red-500 font-medium">
            {t('students.terminalWarning')}
          </p>
        )}
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!selectedStatus}
          variant={isTerminal ? 'danger' : 'primary'}
        >
          {t('students.changeStatus')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

