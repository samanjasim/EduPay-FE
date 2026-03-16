import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { UserCheck, Search, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Input, Pagination } from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS, ROUTES } from '@/config';
import type { PaginatedResponse, User } from '@/types';
import { format } from 'date-fns';

export default function ParentsListPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['parents', 'list', { page, search }],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<User>>(
        API_ENDPOINTS.USERS.LIST,
        { params: { role: 'Parent', pageNumber: page, pageSize: 12, searchTerm: search || undefined } }
      );
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const parents = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('parent.title')}
        subtitle={t('parent.allParents')}
      />

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="max-w-md">
            <Input
              placeholder={t('parent.searchParent')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : parents.length === 0 ? (
        <EmptyState icon={UserCheck} title={t('parent.noParentsFound')} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parents.map((parent) => (
              <Link key={parent.id} to={ROUTES.PARENTS.getDetail(parent.id)}>
                <Card className="hover:shadow-soft-md hover:border-primary-200 dark:hover:border-primary-500/30 transition-all cursor-pointer h-full">
                  <CardContent className="py-5 px-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                        {parent.firstName?.[0]}{parent.lastName?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-text-primary truncate">
                            {parent.firstName} {parent.lastName}
                          </h3>
                          <Badge
                            variant={parent.status === 'Active' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {parent.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-muted truncate mt-0.5">@{parent.username}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{parent.email}</span>
                      </div>
                      {parent.createdAt && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{format(new Date(parent.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={pagination.pageNumber}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
