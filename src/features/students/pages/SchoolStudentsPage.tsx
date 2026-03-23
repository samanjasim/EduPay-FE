import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, Eye, UserRoundSearch, LayoutGrid, LayoutList, User } from 'lucide-react';
import {
  Card, Badge, Button, Input, Select, Spinner, Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useStudents } from '../api';
import { useGrades } from '@/features/grades/api';
import { useDebounce } from '@/hooks';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import type { StudentListParams, StudentSummaryDto, StudentStatus } from '@/types';

const STATUS_BADGE_MAP: Record<StudentStatus, 'success' | 'warning' | 'primary' | 'default' | 'error'> = {
  Active: 'success', Suspended: 'warning', Graduated: 'primary', Transferred: 'default', Withdrawn: 'error',
};

const PAGE_SIZE = 12;

export default function SchoolStudentsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  const genderOptions = [
    { value: '', label: t('students.allGenders') },
    { value: 'Male', label: t('students.male') },
    { value: 'Female', label: t('students.female') },
  ];

  const params: StudentListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    searchTerm: debouncedSearch || undefined,
    status: (statusFilter || undefined) as StudentStatus | undefined,
    gradeId: gradeFilter || undefined,
    gender: (genderFilter || undefined) as 'Male' | 'Female' | undefined,
  };

  const { data, isLoading } = useStudents(params);
  const students = data?.data ?? [];
  const pagination = data?.pagination;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('students.title')} subtitle={t('students.allStudents')} />

      {/* Filters + View toggle */}
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
        <Select options={gradeOptions} value={gradeFilter} onChange={(v) => { setGradeFilter(v); setPage(1); }} placeholder={t('students.allGrades')} className="w-36" />
        <Select options={statusOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} placeholder={t('students.allStatuses')} className="w-36" />
        <Select options={genderOptions} value={genderFilter} onChange={(v) => { setGenderFilter(v); setPage(1); }} placeholder={t('students.allGenders')} className="w-32" />

        {/* View toggle */}
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => setViewMode('table')}
            className={cn('p-2 transition-colors', viewMode === 'table' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20' : 'text-text-muted hover:text-text-primary')}
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={cn('p-2 transition-colors', viewMode === 'card' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20' : 'text-text-muted hover:text-text-primary')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {selectedIds.size} selected
          </span>
          <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : students.length === 0 ? (
        <EmptyState icon={UserRoundSearch} title={t('common.noResults')} description="No students found matching your filters." />
      ) : viewMode === 'table' ? (
        <TableView students={students} pagination={pagination} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} setPage={setPage} />
      ) : (
        <CardView students={students} pagination={pagination} setPage={setPage} />
      )}
    </div>
  );
}

// --- Table View ---
function TableView({ students, pagination, selectedIds, toggleSelect, toggleSelectAll, setPage }: {
  students: StudentSummaryDto[];
  pagination: any;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  setPage: (p: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="px-4 py-3 text-start">
                <input
                  type="checkbox"
                  checked={selectedIds.size === students.length && students.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="px-4 py-3 text-start font-medium">{t('students.name')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('students.studentCode')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('students.gradeSection')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('students.gender')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('students.status')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-hover transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{s.fullNameEn}</p>
                  <p className="text-xs text-text-muted" dir="rtl">{s.fullNameAr}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{s.studentCode}</td>
                <td className="px-4 py-3 text-text-secondary">{s.gradeName}{s.sectionName ? ` / ${s.sectionName}` : ''}</td>
                <td className="px-4 py-3 text-text-secondary">{s.gender}</td>
                <td className="px-4 py-3"><Badge variant={STATUS_BADGE_MAP[s.status]}>{s.status}</Badge></td>
                <td className="px-4 py-3">
                  <Link to={ROUTES.SCHOOL.STUDENTS.getDetail(s.id)}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
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
  );
}

// --- Card View ---
function CardView({ students, pagination, setPage }: {
  students: StudentSummaryDto[];
  pagination: any;
  setPage: (p: number) => void;
}) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {students.map((s) => (
          <Link key={s.id} to={ROUTES.SCHOOL.STUDENTS.getDetail(s.id)}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-4 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 mb-3">
                  <User className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-medium text-text-primary text-sm">{s.fullNameEn}</p>
                <p className="text-xs text-text-muted mt-0.5" dir="rtl">{s.fullNameAr}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default">{s.gradeName}{s.sectionName ? ` / ${s.sectionName}` : ''}</Badge>
                </div>
                <div className="mt-2">
                  <Badge variant={STATUS_BADGE_MAP[s.status]}>{s.status}</Badge>
                </div>
                <p className="text-xs text-text-muted mt-2">{s.studentCode}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
