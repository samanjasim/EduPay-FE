import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserRoundSearch, Pencil, Trash2, ArrowRightLeft, Users,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Spinner, Input, Select, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import {
  useStudent, useUpdateStudent, useDeleteStudent, useChangeStudentStatus,
} from '../api';
import { useGrades, useGrade } from '@/features/grades/api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { updateStudentSchema, type UpdateStudentFormData } from '@/lib/validation';
import { format } from 'date-fns';
import type { StudentStatus } from '@/types';

const STATUS_BADGE_MAP: Record<StudentStatus, 'success' | 'warning' | 'primary' | 'default' | 'error'> = {
  Active: 'success',
  Suspended: 'warning',
  Graduated: 'primary',
  Transferred: 'default',
  Withdrawn: 'error',
};

const VALID_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  Active: ['Suspended', 'Graduated', 'Transferred', 'Withdrawn'],
  Suspended: ['Active'],
  Graduated: [],
  Transferred: [],
  Withdrawn: [],
};

const TERMINAL_STATUSES: StudentStatus[] = ['Graduated', 'Transferred', 'Withdrawn'];

export default function StudentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { data: student, isLoading } = useStudent(id!);

  const { mutate: deleteStudentMutation, isPending: isDeleting } = useDeleteStudent();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const canUpdate = hasPermission(PERMISSIONS.Students.Update);
  const canDelete = hasPermission(PERMISSIONS.Students.Delete);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const isTerminalStatus = TERMINAL_STATUSES.includes(student.status);

  const handleDelete = () => {
    deleteStudentMutation(id!, {
      onSuccess: () => navigate(ROUTES.STUDENTS.LIST),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.STUDENTS.LIST}
        backLabel={t('students.backToStudents')}
      />

      {/* Header Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <UserRoundSearch className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-text-primary">{student.fullNameEn}</h1>
              <p className="text-sm text-text-muted mt-0.5" dir="rtl">{student.fullNameAr}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <Badge variant={STATUS_BADGE_MAP[student.status]}>
                {t(`students.status${student.status}`)}
              </Badge>
              <Badge variant="default">{student.studentCode}</Badge>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label={t('students.fullNameAr')}>
              <span dir="rtl">{student.fullNameAr}</span>
            </InfoField>
            <InfoField label={t('students.fullNameEn')}>{student.fullNameEn}</InfoField>
            <InfoField label={t('students.studentCode')}>{student.studentCode}</InfoField>
            <InfoField label={t('students.nationalId')}>{student.nationalId ?? '—'}</InfoField>
            <InfoField label={t('students.dateOfBirth')}>
              {format(new Date(student.dateOfBirth), 'MMMM d, yyyy')}
            </InfoField>
            <InfoField label={t('students.gender')}>
              {t(`students.${student.gender.toLowerCase()}`)}
            </InfoField>
            <InfoField label={t('students.grade')}>
              {student.gradeName}
              {student.sectionName && <span className="text-text-muted"> / {student.sectionName}</span>}
            </InfoField>
            <InfoField label={t('students.academicYear')}>{student.academicYearLabel}</InfoField>
            <InfoField label={t('common.createdAt')}>
              {format(new Date(student.createdAt), 'MMMM d, yyyy')}
            </InfoField>
            {student.modifiedAt && (
              <InfoField label={t('students.modifiedAt')}>
                {format(new Date(student.modifiedAt), 'MMMM d, yyyy')}
              </InfoField>
            )}
          </div>

          {/* Actions */}
          {(canUpdate || canDelete) && (
            <div className="flex items-center gap-2 border-t border-border pt-4 flex-wrap">
              {canUpdate && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    leftIcon={<Pencil className="h-4 w-4" />}
                  >
                    {t('common.edit')}
                  </Button>
                  {!isTerminalStatus && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowStatusModal(true)}
                      leftIcon={<ArrowRightLeft className="h-4 w-4" />}
                    >
                      {t('students.changeStatus')}
                    </Button>
                  )}
                </>
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

      {/* Parents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('students.parents')} ({student.parents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {student.parents.length === 0 ? (
            <p className="py-4 text-sm text-text-muted">{t('students.noParents')}</p>
          ) : (
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('students.parentName')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('students.relation')}
                    </th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('students.linkedAt')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {student.parents.map((parent) => (
                    <tr key={parent.parentUserId} className="hover:bg-hover/50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-text-primary">{parent.parentName}</td>
                      <td className="px-4 py-3.5 text-text-secondary">
                        {t(`students.relation${parent.relation}`)}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {format(new Date(parent.linkedAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('students.deleteStudent')}
        description={t('students.deleteConfirmation', { name: student.fullNameEn })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <EditStudentDetailModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          student={student}
        />
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <StatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          studentId={id!}
          studentName={student.fullNameEn}
          currentStatus={student.status}
        />
      )}
    </div>
  );
}

/* ─── Edit Student Modal (Detail Page) ─── */

function EditStudentDetailModal({
  isOpen, onClose, student,
}: {
  isOpen: boolean; onClose: () => void;
  student: { id: string; fullNameAr: string; fullNameEn: string; nationalId: string | null; studentCode: string; gradeId: string; sectionId: string | null; dateOfBirth: string; gender: 'Male' | 'Female' };
}) {
  const { t } = useTranslation();
  const { mutate: updateStudent, isPending } = useUpdateStudent();

  const {
    register, handleSubmit, watch, setValue, formState: { errors },
  } = useForm<UpdateStudentFormData>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      fullNameAr: student.fullNameAr,
      fullNameEn: student.fullNameEn,
      nationalId: student.nationalId ?? '',
      studentCode: student.studentCode,
      gradeId: student.gradeId,
      sectionId: student.sectionId ?? '',
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
    },
  });

  const selectedGradeId = watch('gradeId');

  const { data: gradesData } = useGrades({ isActive: true, pageSize: 100 });
  const gradeOptions = useMemo(() =>
    (gradesData?.data ?? []).map((g) => ({ value: g.id, label: g.name })),
    [gradesData]
  );

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

  // Reset section when grade changes from original
  useEffect(() => {
    if (selectedGradeId && selectedGradeId !== student.gradeId) {
      setValue('sectionId', '');
    }
  }, [selectedGradeId, student.gradeId, setValue]);

  const onSubmit = (data: UpdateStudentFormData) => {
    const payload = {
      ...data,
      nationalId: data.nationalId || undefined,
      sectionId: data.sectionId || undefined,
    };
    updateStudent({ id: student.id, data: payload }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('students.editStudent')} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('students.fullNameAr')} error={errors.fullNameAr?.message} dir="rtl" {...register('fullNameAr')} />
          <Input label={t('students.fullNameEn')} error={errors.fullNameEn?.message} {...register('fullNameEn')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('students.studentCode')} error={errors.studentCode?.message} {...register('studentCode')} />
          <Input label={t('students.nationalId')} error={errors.nationalId?.message} {...register('nationalId')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('students.dateOfBirth')} type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('students.gender')}</label>
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
            {errors.gender?.message && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('students.grade')} options={gradeOptions} value={selectedGradeId}
            onChange={(v) => setValue('gradeId', v)} error={errors.gradeId?.message} placeholder={t('students.selectGrade')}
          />
          <Select
            label={t('students.section')} options={sectionOptions} value={watch('sectionId') ?? ''}
            onChange={(v) => setValue('sectionId', v)} placeholder={t('students.selectSection')} disabled={!selectedGradeId}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" isLoading={isPending}>{t('common.save')}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Status Change Modal ─── */

function StatusModal({
  isOpen, onClose, studentId, studentName, currentStatus,
}: {
  isOpen: boolean; onClose: () => void;
  studentId: string; studentName: string; currentStatus: StudentStatus;
}) {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: changeStatus, isPending } = useChangeStudentStatus();

  const validStatuses = VALID_TRANSITIONS[currentStatus] ?? [];
  const statusOptions = validStatuses.map((s) => ({
    value: s, label: t(`students.status${s}`),
  }));

  const isTerminal = TERMINAL_STATUSES.includes(selectedStatus as StudentStatus);

  const handleConfirm = () => {
    changeStatus(
      { id: studentId, data: { status: selectedStatus as StudentStatus } },
      { onSuccess: () => { setSelectedStatus(''); setShowConfirm(false); onClose(); } }
    );
  };

  const handleClose = () => { setSelectedStatus(''); setShowConfirm(false); onClose(); };

  if (showConfirm) {
    const confirmKey = selectedStatus === 'Active'
      ? 'students.reactivateConfirmation'
      : `students.${selectedStatus.toLowerCase()}Confirmation`;
    return (
      <ConfirmModal
        isOpen onClose={() => setShowConfirm(false)} onConfirm={handleConfirm}
        title={t('students.changeStatus')}
        description={t(confirmKey, { name: studentName })}
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
          <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('students.currentStatus')}</label>
          <Badge variant={STATUS_BADGE_MAP[currentStatus]}>{t(`students.status${currentStatus}`)}</Badge>
        </div>
        <Select
          label={t('students.newStatus')} options={statusOptions} value={selectedStatus}
          onChange={setSelectedStatus} placeholder={t('students.selectStatus')}
        />
        {isTerminal && selectedStatus && (
          <p className="text-xs text-red-500 font-medium">{t('students.terminalWarning')}</p>
        )}
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={() => setShowConfirm(true)} disabled={!selectedStatus} variant={isTerminal ? 'danger' : 'primary'}>
          {t('students.changeStatus')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
