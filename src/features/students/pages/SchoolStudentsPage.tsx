import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, Eye, UserRoundSearch } from 'lucide-react';
import {
  Card, Badge, Button, Input, Select, Spinner, Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useStudents } from '../api';
import { useGrades } from '@/features/grades/api';
import { useDebounce } from '@/hooks';
import { ROUTES } from '@/config';
import type { StudentListParams, StudentStatus } from '@/types';

const STATUS_BADGE_MAP: Record<StudentStatus, 'success' | 'warning' | 'primary' | 'default' | 'error'> = {
  Active: 'success',
  Suspended: 'warning',
  Graduated: 'primary',
  Transferred: 'default',
  Withdrawn: 'error',
};

const PAGE_SIZE = 10;

export default function SchoolStudentsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: gradesData } = useGrades();
  const gradeOptions = useMemo(() => {
    const opts = (gradesData?.data ?? []).map((g) => ({ value: g.id, label: g.name }));
    opts.unshift({ value: '', label: t('students.allGrades') });
    return opts;
  }, [gradesData, t]);

  const statusOptions = [
    { value: '', label: t('students.allStatuses') },
    { value: 'Active', label: t('students.statusActive') },
    { value: 'Suspended', label: t('students.statusSuspended') },
    { value: 'Graduated', label: t('students.statusGraduated') },
    { value: 'Transferred', label: t('students.statusTransferred') },
    { value: 'Withdrawn', label: t('students.statusWithdrawn') },
  ];

  const params: StudentListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    searchTerm: debouncedSearch || undefined,
    status: (statusFilter || undefined) as StudentStatus | undefined,
    gradeId: gradeFilter || undefined,
  };

  const { data, isLoading } = useStudents(params);
  const students = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('students.title')}
        subtitle={t('students.allStudents')}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder={t('common.search')}
            className="ltr:pl-9 rtl:pr-9"
          />
        </div>
        <Select
          options={gradeOptions}
          value={gradeFilter}
          onChange={(v) => { setGradeFilter(v); setPage(1); }}
          placeholder={t('students.allGrades')}
          className="w-40"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder={t('students.allStatuses')}
          className="w-40"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={UserRoundSearch}
          title={t('common.noResults')}
          description="No students found matching your filters."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="px-4 py-3 text-start font-medium">{t('students.name')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('students.studentCode')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('students.gradeSection')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('students.status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-hover transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{s.fullNameEn}</p>
                        <p className="text-xs text-text-muted" dir="rtl">{s.fullNameAr}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{s.studentCode}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {s.gradeName}{s.sectionName ? ` / ${s.sectionName}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE_MAP[s.status]}>{s.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={ROUTES.SCHOOL.STUDENTS.getDetail(s.id)}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border p-4">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
