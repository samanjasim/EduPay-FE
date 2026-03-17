import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UsersRound, Search, Pencil } from 'lucide-react';
import {
  Card, CardContent, Badge, Input, Spinner, Pagination, Button, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useParents, useUpdateParent } from '../api';
import { useDebounce, usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { updateUserSchema, type UpdateUserFormData } from '@/lib/validation';
import { format } from 'date-fns';
import type { ParentListParams, ParentSummary } from '@/types';

const PAGE_SIZE = 10;

export default function ParentsListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const canManageParents = hasPermission(PERMISSIONS.Students.ManageParents);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [editingParent, setEditingParent] = useState<ParentSummary | null>(null);
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
                      {canManageParents && (
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('common.actions')}
                        </th>
                      )}
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
                        {canManageParents && (
                          <td className="px-4 py-3.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingParent(parent)}
                              leftIcon={<Pencil className="h-4 w-4" />}
                            >
                              {t('common.edit')}
                            </Button>
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
      {/* Edit Parent Modal */}
      {editingParent && (
        <EditParentModal
          isOpen={!!editingParent}
          onClose={() => setEditingParent(null)}
          parent={editingParent}
        />
      )}
    </div>
  );
}

/* ─── Edit Parent Modal ─── */

function EditParentModal({
  isOpen, onClose, parent,
}: {
  isOpen: boolean; onClose: () => void;
  parent: ParentSummary;
}) {
  const { t } = useTranslation();
  const { mutate: updateParent, isPending } = useUpdateParent();

  const {
    register, handleSubmit, formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema(t)),
    defaultValues: {
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      phoneNumber: parent.phoneNumber ?? '',
    },
  });

  const onSubmit = (data: UpdateUserFormData) => {
    const payload = {
      ...data,
      phoneNumber: data.phoneNumber || null,
    };
    updateParent({ parentUserId: parent.parentUserId, data: payload }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('parents.editParent')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('parents.firstName')} error={errors.firstName?.message} {...register('firstName')} />
          <Input label={t('parents.lastName')} error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label={t('parents.email')} type="email" error={errors.email?.message} {...register('email')} />
        <Input
          label={t('parents.phoneNumber')}
          placeholder="+9647XXXXXXXXX"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" isLoading={isPending}>{t('common.save')}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
