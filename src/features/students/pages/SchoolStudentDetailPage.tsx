import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Card, Badge, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useStudent } from '../api';
import { useFeeInstances } from '@/features/fees/api';
import { ROUTES } from '@/config';

export default function SchoolStudentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id!);
  const { data: feesData } = useFeeInstances({ studentId: id, pageSize: 20 });
  const fees = feesData?.data ?? [];

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  if (!student) {
    return <p className="text-text-muted">{t('common.noResults')}</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.fullNameEn}
        subtitle={student.studentCode}
        backTo={ROUTES.SCHOOL.STUDENTS.LIST}
        backLabel={t('students.backToStudents')}
      />

      {/* Student Info */}
      <Card>
        <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label={t('students.fullNameAr')} value={student.fullNameAr} dir="rtl" />
          <InfoField label={t('students.fullNameEn')} value={student.fullNameEn} />
          <InfoField label={t('students.studentCode')} value={student.studentCode} />
          <InfoField label={t('students.grade')} value={student.gradeName} />
          <InfoField label={t('students.section')} value={student.sectionName || '—'} />
          <InfoField label={t('students.gender')} value={student.gender} />
          <InfoField label={t('students.dateOfBirth')} value={student.dateOfBirth} />
          <div>
            <p className="text-xs text-text-muted mb-1">{t('students.status')}</p>
            <Badge variant={student.status === 'Active' ? 'success' : 'warning'}>{student.status}</Badge>
          </div>
        </div>
      </Card>

      {/* Fee Instances */}
      <Card>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">{t('schoolPortal.nav.fees')}</h3>
          {fees.length === 0 ? (
            <p className="text-sm text-text-muted">No fees found for this student.</p>
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
                    <tr key={fee.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-text-primary">{fee.feeStructureName}</td>
                      <td className="px-3 py-2 text-text-secondary">{fee.amount?.toLocaleString()}</td>
                      <td className="px-3 py-2 text-text-secondary">{fee.dueDate}</td>
                      <td className="px-3 py-2">
                        <Badge variant={fee.status === 'Paid' ? 'success' : fee.status === 'Overdue' ? 'error' : 'warning'}>
                          {fee.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
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
