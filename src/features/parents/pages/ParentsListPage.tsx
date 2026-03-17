import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UsersRound, Search } from 'lucide-react';
import {
  Card, CardContent, Badge, Input, Spinner, Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useParents } from '../api';
import { useDebounce } from '@/hooks';
import { format } from 'date-fns';
import type { ParentListParams } from '@/types';

const PAGE_SIZE = 10;

export default function ParentsListPage() {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const params: ParentListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
  };

  const { data, isLoading } = useParents(params);
  const parents = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('parents.title')}
        subtitle={t('parents.allParents')}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:max-w-xs flex-1">
          <Input
            placeholder={t('parents.searchParents')}
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : parents.length === 0 ? (
        <EmptyState icon={UsersRound} title={t('parents.noParents')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('students.name')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('parents.email')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('parents.phoneNumber')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('parents.linkedStudents')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('parents.firstLinkedAt')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parents.map((parent) => (
                      <tr key={parent.parentUserId} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                              {parent.firstName[0]}{parent.lastName[0]}
                            </div>
                            <span className="font-medium text-text-primary">
                              {parent.firstName} {parent.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {parent.email}
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary" dir="ltr">
                          {parent.phoneNumber ?? '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="default" size="sm">
                            {parent.linkedStudentCount}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">
                          {format(new Date(parent.firstLinkedAt), 'MMM d, yyyy')}
                        </td>
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
    </div>
  );
}
