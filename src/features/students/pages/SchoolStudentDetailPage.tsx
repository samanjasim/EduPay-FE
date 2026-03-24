import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Card, Badge, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useStudent } from '../api';
import { useFeeInstances } from '@/features/fees/api';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import type { FeeInstanceStatus } from '@/types';

type Tab = 'info' | 'fees' | 'parents';

const FEE_STATUS_BADGE: Record<FeeInstanceStatus, 'success' | 'warning' | 'error' | 'default'> = {
  Pending: 'warning', Paid: 'success', Overdue: 'error', Waived: 'default', Cancelled: 'default',
};

export default function SchoolStudentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id!);
  const [activeTab, setActiveTab] = useState<Tab>('info');

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

      {/* Status badge */}
      <div className="flex items-center gap-3">
        <Badge variant={student.status === 'Active' ? 'success' : student.status === 'Suspended' ? 'warning' : 'default'}>
          {student.status}
        </Badge>
        <span className="text-sm text-text-muted">{student.gender}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-surface-200 p-1 dark:bg-surface-elevated w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && <InfoTab student={student} />}
      {activeTab === 'fees' && <FeesTab studentId={id!} />}
      {activeTab === 'parents' && <ParentsTab parents={student.parents ?? []} />}
    </div>
  );
}

function InfoTab({ student }: { student: any }) {
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
        {student.modifiedAt && (
          <InfoField label={t('students.modifiedAt')} value={new Date(student.modifiedAt).toLocaleDateString()} />
        )}
      </div>
    </Card>
  );
}

function FeesTab({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const { data: feesData, isLoading } = useFeeInstances({ studentId, pageSize: 50 });
  const fees = feesData?.data ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <Card>
      <div className="p-5">
        {fees.length === 0 ? (
          <p className="text-sm text-text-muted">No fees found for this student.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="px-3 py-2 text-start font-medium">{t('feeInstances.feeStructure')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('feeInstances.feeType')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('feeInstances.amount')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('feeInstances.discount')}</th>
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
                    <td className="px-3 py-2 text-text-secondary">{fee.feeTypeName}</td>
                    <td className="px-3 py-2 text-text-secondary">{fee.amount?.toLocaleString()}</td>
                    <td className="px-3 py-2 text-text-secondary">{fee.discountAmount ? fee.discountAmount.toLocaleString() : '—'}</td>
                    <td className="px-3 py-2 text-text-secondary">{fee.dueDate}</td>
                    <td className="px-3 py-2">
                      <Badge variant={FEE_STATUS_BADGE[fee.status]}>{fee.status}</Badge>
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

function ParentsTab({ parents }: { parents: any[] }) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="p-5">
        {parents.length === 0 ? (
          <p className="text-sm text-text-muted">{t('students.noParents')}</p>
        ) : (
          <div className="space-y-3">
            {parents.map((p: any) => (
              <div key={p.parentUserId} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.parentName}</p>
                  <p className="text-xs text-text-muted">{t(`parents.relation${p.relation}`)}</p>
                </div>
                <span className="text-xs text-text-muted">
                  {t('students.linkedAt')}: {new Date(p.linkedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
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
