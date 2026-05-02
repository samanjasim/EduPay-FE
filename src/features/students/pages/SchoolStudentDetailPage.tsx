import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, UserPlus, Unlink } from 'lucide-react';
import { Card, Badge, Spinner, Button, Input, Select, Modal, ModalFooter } from '@/components/ui';
import { PageHeader, ConfirmModal, TabSwitcher } from '@/components/common';
import {
  useStudent, useUpdateStudent, useChangeStudentStatus,
  useEnrollParent, useUnlinkParent,
} from '../api';
import { useGrades, useGrade } from '@/features/grades/api';
import { useFeeInstances } from '@/features/fees/api';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import {
  updateStudentSchema, type UpdateStudentFormData,
  enrollParentSchema, type EnrollParentFormData,
} from '@/lib/validation';
import {
  FEE_INSTANCE_STATUS_BADGE,
  STUDENT_STATUS_BADGE,
  STUDENT_STATUS_TRANSITIONS,
} from '@/constants/status-maps';
import type { StudentStatus, StudentDetailDto, StudentParentDto } from '@/types';

type Tab = 'info' | 'fees' | 'parents';

export default function SchoolStudentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id!);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [showEdit, setShowEdit] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [showEnrollParent, setShowEnrollParent] = useState(false);
  const [parentToUnlink, setParentToUnlink] = useState<string | null>(null);
  const unlinkParent = useUnlinkParent();

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  if (!student) {
    return <p className="text-text-muted">{t('common.noResults')}</p>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: t('students.title') },
    { key: 'fees', label: t('schoolPortal.nav.fees') },
    { key: 'parents', label: t('students.parents') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.fullNameEn}
        subtitle={`${student.studentCode} · ${student.gradeName}${student.sectionName ? ` / ${student.sectionName}` : ''}`}
        backTo={ROUTES.SCHOOL.STUDENTS.LIST}
        backLabel={t('students.backToStudents')}
      />

      {/* Status badge + actions */}
      <div className="flex items-center gap-3">
        <Badge variant={STUDENT_STATUS_BADGE[student.status as StudentStatus] ?? 'default'}>
          {student.status}
        </Badge>
        <span className="text-sm text-text-muted">{student.gender}</span>
        <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-3.5 w-3.5 ltr:mr-1.5 rtl:ml-1.5" />
            {t('common.edit')}
          </Button>
          {STUDENT_STATUS_TRANSITIONS[student.status as StudentStatus]?.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowStatusChange(true)}>
              {t('students.changeStatus')}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'info' && <InfoTab student={student} />}
      {activeTab === 'fees' && <FeesTab studentId={id!} />}
      {activeTab === 'parents' && (
        <ParentsTab
          parents={student.parents ?? []}
          onAddParent={() => setShowEnrollParent(true)}
          onUnlinkParent={(parentUserId: string) => setParentToUnlink(parentUserId)}
        />
      )}

      {/* Edit Modal */}
      {showEdit && (
        <EditStudentModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          student={student}
        />
      )}

      {/* Status Change Modal */}
      {showStatusChange && (
        <StatusChangeModal
          isOpen={showStatusChange}
          onClose={() => setShowStatusChange(false)}
          studentId={id!}
          currentStatus={student.status as StudentStatus}
        />
      )}

      {/* Enroll Parent Modal */}
      {showEnrollParent && (
        <EnrollParentModal
          isOpen={showEnrollParent}
          onClose={() => setShowEnrollParent(false)}
          studentId={id!}
        />
      )}

      {/* Unlink Parent Confirm */}
      <ConfirmModal
        isOpen={!!parentToUnlink}
        onClose={() => setParentToUnlink(null)}
        onConfirm={() => {
          if (parentToUnlink) {
            unlinkParent.mutate(
              { studentId: id!, parentUserId: parentToUnlink },
              { onSuccess: () => setParentToUnlink(null) }
            );
          }
        }}
        title={t('students.unlinkParent')}
        description={t('students.unlinkParentDesc')}
        confirmLabel={t('students.unlink')}
        isLoading={unlinkParent.isPending}
      />
    </div>
  );
}

/* ─── Info Tab ─── */
function InfoTab({ student }: { student: StudentDetailDto }) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoField label={t('students.fullNameAr')} value={student.fullNameAr} dir="rtl" />
        <InfoField label={t('students.fullNameEn')} value={student.fullNameEn} />
        <InfoField label={t('students.studentCode')} value={student.studentCode} />
        <InfoField label={t('students.nationalId')} value={student.nationalId || '—'} />
        <InfoField label={t('students.grade')} value={student.gradeName} />
        <InfoField label={t('students.section')} value={student.sectionName || '—'} />
        <InfoField label={t('students.gender')} value={student.gender} />
        <InfoField label={t('students.dateOfBirth')} value={student.dateOfBirth} />
        <InfoField label={t('students.academicYear')} value={student.academicYearLabel} />
        <InfoField label={t('common.createdAt')} value={new Date(student.createdAt).toLocaleDateString()} />
      </div>
    </Card>
  );
}

/* ─── Fees Tab ─── */
function FeesTab({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const { data: feesData, isLoading } = useFeeInstances({ studentId, pageSize: 50 });
  const fees = feesData?.data ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <Card>
      <div className="p-5">
        {fees.length === 0 ? (
          <p className="text-sm text-text-muted">{t('feeInstances.noStudentFees')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="px-3 py-2 text-start font-medium">{t('feeInstances.feeStructure')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('feeInstances.amount')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('feeInstances.dueDate')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id} className={cn(
                    'border-b border-border last:border-0',
                    fee.status === 'Overdue' && 'bg-red-50/50 dark:bg-red-500/5'
                  )}>
                    <td className="px-3 py-2 text-text-primary">{fee.feeStructureName}</td>
                    <td className="px-3 py-2 text-text-secondary">{fee.amount?.toLocaleString()}</td>
                    <td className="px-3 py-2 text-text-secondary">{fee.dueDate}</td>
                    <td className="px-3 py-2">
                      <Badge variant={FEE_INSTANCE_STATUS_BADGE[fee.status]}>{fee.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ─── Parents Tab ─── */
function ParentsTab({
  parents, onAddParent, onUnlinkParent,
}: {
  parents: StudentParentDto[];
  onAddParent: () => void;
  onUnlinkParent: (parentUserId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">{t('students.parents')}</h3>
          <Button size="sm" onClick={onAddParent}>
            <UserPlus className="h-3.5 w-3.5 ltr:mr-1.5 rtl:ml-1.5" />
            {t('students.addParent')}
          </Button>
        </div>
        {parents.length === 0 ? (
          <p className="text-sm text-text-muted">{t('students.noParents')}</p>
        ) : (
          <div className="space-y-3">
            {parents.map((p) => (
              <div key={p.parentUserId} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.parentName}</p>
                  <p className="text-xs text-text-muted">{p.relation}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onUnlinkParent(p.parentUserId)}>
                  <Unlink className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ─── Edit Student Modal ─── */
function EditStudentModal({
  isOpen, onClose, student,
}: {
  isOpen: boolean; onClose: () => void;
  student: StudentDetailDto;
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
      ...sections.map((s) => ({ value: s.id, label: s.capacity ? `${s.name} (${s.capacity})` : s.name })),
    ];
  }, [gradeDetail, t]);

  useEffect(() => {
    if (selectedGradeId && selectedGradeId !== student.gradeId) {
      setValue('sectionId', '');
    }
  }, [selectedGradeId, student.gradeId, setValue]);

  const onSubmit = (data: UpdateStudentFormData) => {
    updateStudent(
      { id: student.id, data: { ...data, nationalId: data.nationalId || undefined, sectionId: data.sectionId || undefined } },
      { onSuccess: onClose }
    );
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
          <Input label={t('students.nationalId')} {...register('nationalId')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('students.dateOfBirth')} type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('students.gender')}</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="Male" className="accent-primary-600" {...register('gender')} /> {t('students.male')}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="Female" className="accent-primary-600" {...register('gender')} /> {t('students.female')}
              </label>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label={t('students.grade')} options={gradeOptions} value={selectedGradeId} onChange={(v) => setValue('gradeId', v)} error={errors.gradeId?.message} />
          <Select label={t('students.section')} options={sectionOptions} value={watch('sectionId') ?? ''} onChange={(v) => setValue('sectionId', v)} disabled={!selectedGradeId} />
        </div>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" isLoading={isPending}>{t('common.save')}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Status Change Modal ─── */
function StatusChangeModal({
  isOpen, onClose, studentId, currentStatus,
}: {
  isOpen: boolean; onClose: () => void;
  studentId: string; currentStatus: StudentStatus;
}) {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState('');
  const { mutate: changeStatus, isPending } = useChangeStudentStatus();

  const validStatuses = STUDENT_STATUS_TRANSITIONS[currentStatus] ?? [];

  const handleConfirm = () => {
    changeStatus(
      { id: studentId, data: { status: selectedStatus as StudentStatus } },
      { onSuccess: () => { setSelectedStatus(''); onClose(); } }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('students.changeStatus')} size="sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary px-4 py-3">
          <span className="text-sm font-medium text-text-secondary">{t('students.currentStatus')}</span>
          <Badge variant={STUDENT_STATUS_BADGE[currentStatus]}>{currentStatus}</Badge>
        </div>
        <div className="space-y-1.5">
          {validStatuses.map((status) => (
            <label
              key={status}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
                selectedStatus === status
                  ? 'border-primary-300 bg-primary-50 dark:border-primary-500/30 dark:bg-primary-500/10'
                  : 'border-border hover:bg-hover/50'
              )}
            >
              <input
                type="radio" name="newStatus" value={status}
                checked={selectedStatus === status}
                onChange={() => setSelectedStatus(status)}
                className="accent-primary-600"
              />
              <span className="font-medium text-text-primary">{status}</span>
            </label>
          ))}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirm} disabled={!selectedStatus} isLoading={isPending}>
            {t('common.confirm')}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

/* ─── Enroll Parent Modal ─── */
function EnrollParentModal({
  isOpen, onClose, studentId,
}: {
  isOpen: boolean; onClose: () => void; studentId: string;
}) {
  const { t } = useTranslation();
  const enrollParent = useEnrollParent();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EnrollParentFormData>({
    resolver: zodResolver(enrollParentSchema(t)),
  });

  const relationOptions = [
    { value: 'Father', label: t('parents.father') },
    { value: 'Mother', label: t('parents.mother') },
    { value: 'Guardian', label: t('parents.guardian') },
  ];

  const onSubmit = (data: EnrollParentFormData) => {
    enrollParent.mutate(
      { studentId, data },
      { onSuccess: () => { reset(); onClose(); } }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('students.addParent')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hint banner */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          {t('parents.enrollHint')}
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {t('parents.enrollSmsHint')}
        </div>

        {/* Required: Email + Phone + Relation */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">{t('validation.required', { field: '' }).replace(' is required', '')}</p>
          <div className="space-y-3">
            <Input label={t('users.email')} type="email" {...register('email')} error={errors.email?.message} placeholder="parent@example.com" />
            <Input
              label={`${t('users.phone')} *`}
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message}
              placeholder="+9647701234567"
              hint={t('parents.phoneRequiredHelp')}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('students.relation')}</label>
              <div className="flex gap-4">
                {relationOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" value={opt.value} className="accent-primary-600" {...register('relation')} />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.relation?.message && <p className="mt-1 text-xs text-red-500">{errors.relation.message}</p>}
            </div>
          </div>
        </div>

        {/* Optional: New account fields (password optional — parent sets via OTP) */}
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('parents.newAccountFields')}
          </p>
          <p className="mb-3 text-xs text-text-muted">{t('parents.newAccountFieldsHint')}</p>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label={t('users.firstName')} {...register('firstName')} error={errors.firstName?.message} />
              <Input label={t('users.lastName')} {...register('lastName')} error={errors.lastName?.message} />
            </div>
            <Input
              label={`${t('auth.password')} (${t('common.optional')})`}
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder={t('parents.passwordOptionalPlaceholder')}
              hint={t('parents.passwordOptionalHelp')}
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" isLoading={enrollParent.isPending}>{t('students.addParent')}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function InfoField({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium text-text-primary" dir={dir}>{value}</p>
    </div>
  );
}
