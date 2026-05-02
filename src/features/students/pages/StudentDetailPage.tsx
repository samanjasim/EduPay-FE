import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserRoundSearch, Pencil, Trash2, ArrowRightLeft, Users, UserPlus, Link2, Search, X,
  Eye, EyeOff,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Spinner, Input, Select, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import {
  useStudent, useUpdateStudent, useDeleteStudent, useChangeStudentStatus,
} from '../api';
import { useEnrollParent, useLinkParent, useUnlinkParent, useParents } from '@/features/parents/api';
import { useGrades, useGrade } from '@/features/grades/api';
import { usePermissions, useDebounce } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import {
  updateStudentSchema, type UpdateStudentFormData,
  enrollParentSchema, type EnrollParentFormData,
} from '@/lib/validation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { StudentStatus, ParentRelation } from '@/types';

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
  const { mutate: unlinkParentMutation, isPending: isUnlinking } = useUnlinkParent();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showLinkExistingModal, setShowLinkExistingModal] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{ parentUserId: string; parentName: string } | null>(null);

  const canUpdate = hasPermission(PERMISSIONS.Students.Update);
  const canDelete = hasPermission(PERMISSIONS.Students.Delete);
  const canManageParents = hasPermission(PERMISSIONS.Students.ManageParents);

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

  const handleUnlink = () => {
    if (!unlinkTarget) return;
    unlinkParentMutation(
      { studentId: id!, parentUserId: unlinkTarget.parentUserId },
      { onSuccess: () => setUnlinkTarget(null) },
    );
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('students.parents')} ({student.parents.length})
            </CardTitle>
            {canManageParents && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowEnrollModal(true)}
                  leftIcon={<UserPlus className="h-4 w-4" />}
                >
                  {t('parents.enrollParent')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowLinkExistingModal(true)}
                  leftIcon={<Link2 className="h-4 w-4" />}
                >
                  {t('parents.linkExisting')}
                </Button>
              </div>
            )}
          </div>
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
                    {canManageParents && (
                      <th className="px-4 pb-3 text-end text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.actions')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {student.parents.map((parent) => (
                    <tr key={parent.parentUserId} className="hover:bg-hover/50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-text-primary">{parent.parentName}</td>
                      <td className="px-4 py-3.5 text-text-secondary">
                        {t(`parents.relation${parent.relation}`)}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {format(new Date(parent.linkedAt), 'MMM d, yyyy')}
                      </td>
                      {canManageParents && (
                        <td className="px-4 py-3.5 text-end">
                          <button
                            type="button"
                            onClick={() => setUnlinkTarget({ parentUserId: parent.parentUserId, parentName: parent.parentName })}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            {t('parents.unlink')}
                          </button>
                        </td>
                      )}
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

      {/* Unlink Parent Modal */}
      <ConfirmModal
        isOpen={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onConfirm={handleUnlink}
        title={t('parents.unlinkParent')}
        description={t('parents.unlinkConfirmation', { parent: unlinkTarget?.parentName, student: student.fullNameEn })}
        confirmLabel={t('parents.unlink')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isUnlinking}
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

      {/* Enroll Parent Modal */}
      {showEnrollModal && (
        <EnrollParentModal
          isOpen={showEnrollModal}
          onClose={() => setShowEnrollModal(false)}
          studentId={id!}
        />
      )}

      {/* Link Existing Parent Modal */}
      {showLinkExistingModal && (
        <LinkExistingModal
          isOpen={showLinkExistingModal}
          onClose={() => setShowLinkExistingModal(false)}
          studentId={id!}
        />
      )}
    </div>
  );
}

/* ─── Enroll Parent Modal ─── */

function EnrollParentModal({
  isOpen, onClose, studentId,
}: {
  isOpen: boolean; onClose: () => void; studentId: string;
}) {
  const { t } = useTranslation();
  const { mutate: enrollParent, isPending } = useEnrollParent();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<EnrollParentFormData>({
    resolver: zodResolver(enrollParentSchema(t)),
    mode: 'onChange',
  });

  const relationOptions = [
    { value: 'Father', label: t('parents.relationFather') },
    { value: 'Mother', label: t('parents.relationMother') },
    { value: 'Guardian', label: t('parents.relationGuardian') },
  ];

  const onSubmit = (data: EnrollParentFormData) => {
    // Phone is now required by both schema and BE; guarded by zod above.
    const payload = {
      email: data.email,
      relation: data.relation as ParentRelation,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      phoneNumber: data.phoneNumber!,
      password: data.password || null,
    };
    enrollParent(
      { studentId, data: payload },
      {
        onSuccess: (result) => {
          if (result.isNewAccount) {
            toast.success(t('parents.accountCreated'));
          } else {
            toast.success(t('parents.existingLinked', { name: result.parentName }));
          }
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('parents.enrollParent')} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-text-muted">{t('parents.enrollHint')}</p>
        <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
          {t('parents.enrollSmsHint')}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('parents.email')} type="email" error={errors.email?.message} {...register('email')} />
          <Select
            label={t('parents.relation')}
            options={relationOptions}
            value={watch('relation') ?? ''}
            onChange={(v) => setValue('relation', v as ParentRelation, { shouldValidate: true })}
            placeholder={t('parents.selectRelation')}
            error={errors.relation?.message}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('parents.firstName')} error={errors.firstName?.message} {...register('firstName')} />
          <Input label={t('parents.lastName')} error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={`${t('parents.phoneNumber')} *`}
            placeholder="+9647XXXXXXXXX"
            hint={t('parents.phoneRequiredHelp')}
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
          <Input
            label={`${t('parents.password')} (${t('common.optional')})`}
            type={showPassword ? 'text' : 'password'}
            hint={t('parents.passwordOptionalHelp')}
            error={errors.password?.message}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-text-primary">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('password')}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" isLoading={isPending}>{t('parents.enrollParent')}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Link Existing Parent Modal ─── */

function LinkExistingModal({
  isOpen, onClose, studentId,
}: {
  isOpen: boolean; onClose: () => void; studentId: string;
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedParentName, setSelectedParentName] = useState('');
  const [relation, setRelation] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { mutate: linkParent, isPending } = useLinkParent();

  const { data: parentsData, isLoading: isLoadingParents } = useParents(
    { searchTerm: debouncedSearch, pageSize: 10 },
  );

  const parents = parentsData?.data ?? [];
  const showResults = debouncedSearch.length >= 2 && !selectedParentId;

  const relationOptions = [
    { value: 'Father', label: t('parents.relationFather') },
    { value: 'Mother', label: t('parents.relationMother') },
    { value: 'Guardian', label: t('parents.relationGuardian') },
  ];

  const handleSubmit = () => {
    if (!selectedParentId || !relation) return;
    linkParent(
      { studentId, data: { parentUserId: selectedParentId, relation: relation as ParentRelation } },
      { onSuccess: () => handleClose() },
    );
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedParentId('');
    setSelectedParentName('');
    setRelation('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('parents.linkExisting')} size="md">
      <div className="space-y-4">
        {/* Parent search */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('parents.selectParent')}
          </label>
          <Input
            placeholder={t('parents.searchParents')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selectedParentId) {
                setSelectedParentId('');
                setSelectedParentName('');
              }
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
          {/* Dropdown results */}
          {showResults && (
            <div className="mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-soft-lg">
              {isLoadingParents ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : parents.length === 0 ? (
                <p className="px-4 py-3 text-sm text-text-muted">{t('parents.noParentsFound')}</p>
              ) : (
                parents.map((parent) => {
                  const name = `${parent.firstName} ${parent.lastName}`;
                  return (
                    <button
                      key={parent.parentUserId}
                      type="button"
                      onClick={() => {
                        setSelectedParentId(parent.parentUserId);
                        setSelectedParentName(name);
                        setSearchTerm(name);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-hover text-start"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                        {parent.firstName[0]}{parent.lastName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary truncate">{name}</p>
                        <p className="text-xs text-text-muted truncate">{parent.email}</p>
                      </div>
                      <Badge variant="default" className="shrink-0">
                        {parent.linkedStudentCount} {t('parents.linkedStudents').toLowerCase()}
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>
          )}
          {/* Selected parent chip */}
          {selectedParentId && (
            <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2.5 dark:border-primary-500/30 dark:bg-primary-500/10">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-200 text-xs font-medium text-primary-700 dark:bg-primary-500/30 dark:text-primary-300">
                {selectedParentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300 flex-1 min-w-0 truncate">
                {selectedParentName}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedParentId('');
                  setSelectedParentName('');
                  setSearchTerm('');
                }}
                className="text-primary-400 hover:text-primary-600 dark:hover:text-primary-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Relation */}
        <Select
          label={t('parents.relation')}
          options={relationOptions}
          value={relation}
          onChange={setRelation}
          placeholder={t('parents.selectRelation')}
        />
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} isLoading={isPending} disabled={!selectedParentId || !relation}>
          {t('parents.linkParent')}
        </Button>
      </ModalFooter>
    </Modal>
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
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary px-4 py-3">
          <span className="text-sm font-medium text-text-secondary">{t('students.currentStatus')}</span>
          <Badge variant={STATUS_BADGE_MAP[currentStatus]}>{t(`students.status${currentStatus}`)}</Badge>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">{t('students.newStatus')}</label>
          <div className="space-y-1.5">
            {statusOptions.map((option) => {
              const isSelected = selectedStatus === option.value;
              const optionIsTerminal = TERMINAL_STATUSES.includes(option.value as StudentStatus);
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                    isSelected
                      ? optionIsTerminal
                        ? 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
                        : 'border-primary-300 bg-primary-50 dark:border-primary-500/30 dark:bg-primary-500/10'
                      : 'border-border hover:bg-hover/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="newStatus"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setSelectedStatus(option.value)}
                    className="accent-primary-600"
                  />
                  <span className="font-medium text-text-primary">{option.label}</span>
                  {optionIsTerminal && (
                    <span className="text-xs text-red-500">({t('students.terminal')})</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
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
