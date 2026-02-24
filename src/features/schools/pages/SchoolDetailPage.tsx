import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { School, Settings, Users, Trash2, UserPlus, Pencil, Search } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Spinner, Select, Modal, ModalFooter, Input,
} from '@/components/ui';
import { PageHeader, InfoField } from '@/components/common';
import {
  useSchool,
  useUpdateSchool,
  useUpdateSchoolStatus,
  useUpdateSchoolSettings,
  useDeleteSchool,
  useAssignSchoolAdmin,
  useRemoveSchoolAdmin,
} from '../api';
import { useUsers } from '@/features/users/api';
import { usePermissions, useDebounce } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import {
  updateSchoolSchema,
  updateSchoolSettingsSchema,
  type UpdateSchoolFormData,
  type UpdateSchoolSettingsFormData,
} from '@/lib/validation';
import { format } from 'date-fns';
import type { SchoolStatus } from '@/types';

const statusBadgeVariant = (status: SchoolStatus) => {
  const map: Record<SchoolStatus, 'warning' | 'success' | 'error' | 'default'> = {
    Pending: 'warning',
    Active: 'success',
    Suspended: 'error',
    Deactivated: 'default',
  };
  return map[status];
};

const STATUS_KEY_MAP: Record<SchoolStatus, string> = {
  Pending: 'schools.statusPending',
  Active: 'schools.statusActive',
  Suspended: 'schools.statusSuspended',
  Deactivated: 'schools.statusDeactivated',
};

export default function SchoolDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { data: school, isLoading } = useSchool(id!);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateSchoolStatus();
  const { mutate: deleteSchool, isPending: isDeleting } = useDeleteSchool();
  const { mutate: removeAdmin } = useRemoveSchoolAdmin();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [showEditSettingsModal, setShowEditSettingsModal] = useState(false);
  const [removeAdminTarget, setRemoveAdminTarget] = useState<{ userId: string; name: string } | null>(null);

  const statusChangeOptions = [
    { value: 'Active', label: t('schools.statusActive') },
    { value: 'Suspended', label: t('schools.statusSuspended') },
    { value: 'Deactivated', label: t('schools.statusDeactivated') },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!school) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === school.status) return;
    updateStatus({ id: id!, data: { status: newStatus as SchoolStatus } });
  };

  const handleDelete = () => {
    deleteSchool(id!, {
      onSuccess: () => navigate(ROUTES.SCHOOLS.LIST),
    });
  };

  const handleRemoveAdmin = () => {
    if (!removeAdminTarget) return;
    removeAdmin(
      { schoolId: id!, userId: removeAdminTarget.userId },
      { onSuccess: () => setRemoveAdminTarget(null) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.SCHOOLS.LIST}
        backLabel={t('schools.backToSchools')}
      />

      {/* School Header Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              {school.logoUrl ? (
                <img src={school.logoUrl} alt={school.name} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <School className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-text-primary">{school.name}</h1>
              <p className="text-text-secondary">{school.code}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={statusBadgeVariant(school.status)}>
                {t(STATUS_KEY_MAP[school.status])}
              </Badge>
              {hasPermission(PERMISSIONS.Schools.Update) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditSchoolModal(true)}
                  leftIcon={<Pencil className="h-4 w-4" />}
                >
                  {t('common.edit')}
                </Button>
              )}
              {hasPermission(PERMISSIONS.Schools.Delete) && (
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
          </div>

          {/* Info grid */}
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoField label={t('schools.city')}>{school.city}</InfoField>
            <InfoField label={t('schools.contactEmail')}>{school.contactEmail || '—'}</InfoField>
            <InfoField label={t('schools.phone')}>{school.phone || '—'}</InfoField>
            <InfoField label={t('schools.address')}>{school.address || '—'}</InfoField>
            <InfoField label={t('common.createdAt')}>
              {format(new Date(school.createdAt), 'MMMM d, yyyy')}
            </InfoField>
          </div>

          {/* Status change — SuperAdmin/Admin only */}
          {hasPermission(PERMISSIONS.Schools.Update) && (
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <label className="text-sm font-medium text-text-muted">{t('schools.changeStatus')}:</label>
              <Select
                options={statusChangeOptions}
                value={school.status}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
                className="max-w-[200px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Card — SuperAdmin + SchoolAdmin (own school) */}
      {hasPermission(PERMISSIONS.Schools.ManageSettings) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('schools.settings')}
            </CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEditSettingsModal(true)}
              leftIcon={<Pencil className="h-4 w-4" />}
            >
              {t('schools.editSettings')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoField label={t('schools.currency')}>{school.settings.currency}</InfoField>
              <InfoField label={t('schools.timezone')}>{school.settings.timezone}</InfoField>
              <InfoField label={t('schools.defaultLanguage')}>{school.settings.defaultLanguage}</InfoField>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admins Card — SuperAdmin/Admin can manage, others can view */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('schools.admins')} ({school.admins.length})
          </CardTitle>
          {hasPermission(PERMISSIONS.Schools.ManageAdmins) && (
            <Button
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => setShowAddAdminModal(true)}
            >
              {t('schools.assignAdmin')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {school.admins.length === 0 ? (
            <p className="py-4 text-sm text-text-muted">{t('schools.noAdmins')}</p>
          ) : (
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('schools.adminName')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('schools.adminEmail')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('schools.adminRole')}</th>
                    <th className="px-4 pb-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('schools.adminAssigned')}</th>
                    {hasPermission(PERMISSIONS.Schools.ManageAdmins) && (
                      <th className="px-4 pb-3 text-end text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.actions')}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {school.admins.map((admin) => (
                    <tr key={admin.userId} className="hover:bg-hover/50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-text-primary">{admin.fullName}</td>
                      <td className="px-4 py-3.5 text-text-secondary">{admin.email}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={admin.isPrimary ? 'primary' : 'outline'} size="sm">
                          {admin.isPrimary ? t('schools.primaryAdmin') : t('schools.admin')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {format(new Date(admin.assignedAt), 'MMM d, yyyy')}
                      </td>
                      {hasPermission(PERMISSIONS.Schools.ManageAdmins) && (
                        <td className="px-4 py-3.5 text-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRemoveAdminTarget({ userId: admin.userId, name: admin.fullName })}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            {t('common.remove')}
                          </Button>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('schools.deleteSchool')}
        size="sm"
      >
        <p
          className="text-text-secondary"
          dangerouslySetInnerHTML={{ __html: t('schools.deleteConfirmation', { name: school.name }) }}
        />
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            {t('common.delete')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Remove Admin Confirmation Modal */}
      <Modal
        isOpen={!!removeAdminTarget}
        onClose={() => setRemoveAdminTarget(null)}
        title={t('schools.removeAdmin')}
        size="sm"
      >
        <p
          className="text-text-secondary"
          dangerouslySetInnerHTML={{
            __html: t('schools.removeAdminConfirmation', { name: removeAdminTarget?.name ?? '' }),
          }}
        />
        <ModalFooter>
          <Button variant="secondary" onClick={() => setRemoveAdminTarget(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleRemoveAdmin}>
            {t('common.remove')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        schoolId={id!}
      />

      {/* Edit School Modal */}
      {showEditSchoolModal && (
        <EditSchoolModal
          isOpen={showEditSchoolModal}
          onClose={() => setShowEditSchoolModal(false)}
          schoolId={id!}
          defaultValues={{
            name: school.name,
            city: school.city,
            address: school.address ?? '',
            phone: school.phone ?? '',
            contactEmail: school.contactEmail ?? '',
            logoUrl: school.logoUrl ?? '',
          }}
        />
      )}

      {/* Edit Settings Modal */}
      {showEditSettingsModal && (
        <EditSettingsModal
          isOpen={showEditSettingsModal}
          onClose={() => setShowEditSettingsModal(false)}
          schoolId={id!}
          defaultValues={school.settings}
        />
      )}
    </div>
  );
}

/* ─── Edit School Modal ─── */

function EditSchoolModal({
  isOpen,
  onClose,
  schoolId,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  defaultValues: UpdateSchoolFormData;
}) {
  const { t } = useTranslation();
  const { mutate: updateSchool, isPending } = useUpdateSchool();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateSchoolFormData>({
    resolver: zodResolver(updateSchoolSchema),
    defaultValues,
  });

  const onSubmit = (data: UpdateSchoolFormData) => {
    const cleaned = {
      ...data,
      address: data.address || undefined,
      phone: data.phone || undefined,
      contactEmail: data.contactEmail || undefined,
      logoUrl: data.logoUrl || undefined,
    };
    updateSchool(
      { id: schoolId, data: cleaned },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('schools.editSchool')} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('schools.name')}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label={t('schools.city')}
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            label={t('schools.address')}
            placeholder={t('schools.addressPlaceholder')}
            error={errors.address?.message}
            {...register('address')}
          />
          <Input
            label={t('schools.phone')}
            placeholder="+964..."
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label={t('schools.contactEmail')}
            placeholder="admin@school.edu.iq"
            error={errors.contactEmail?.message}
            {...register('contactEmail')}
          />
          <Input
            label={t('schools.logoUrl')}
            placeholder="https://..."
            error={errors.logoUrl?.message}
            {...register('logoUrl')}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Edit Settings Modal ─── */

function EditSettingsModal({
  isOpen,
  onClose,
  schoolId,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  defaultValues: UpdateSchoolSettingsFormData;
}) {
  const { t } = useTranslation();
  const { mutate: updateSettings, isPending } = useUpdateSchoolSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateSchoolSettingsFormData>({
    resolver: zodResolver(updateSchoolSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: UpdateSchoolSettingsFormData) => {
    updateSettings(
      { id: schoolId, data },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('schools.editSettings')} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('schools.currency')}
            error={errors.currency?.message}
            {...register('currency')}
          />
          <Input
            label={t('schools.timezone')}
            hint="e.g. Asia/Baghdad"
            error={errors.timezone?.message}
            {...register('timezone')}
          />
          <Input
            label={t('schools.defaultLanguage')}
            hint="e.g. ar, en, ku"
            error={errors.defaultLanguage?.message}
            {...register('defaultLanguage')}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Add Admin Modal (with user search) ─── */

function AddAdminModal({
  isOpen,
  onClose,
  schoolId,
}: {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { mutate: assignAdmin, isPending } = useAssignSchoolAdmin();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();

  const users = usersData?.data ?? [];

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;
    const term = debouncedSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term)
    );
  }, [users, debouncedSearch]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = () => {
    if (!selectedUserId) return;
    assignAdmin(
      { schoolId, data: { userId: selectedUserId, isPrimary } },
      {
        onSuccess: () => {
          setSearchTerm('');
          setSelectedUserId('');
          setIsPrimary(false);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUserId('');
    setIsPrimary(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('schools.assignAdmin')} size="md">
      <div className="space-y-4">
        {/* User search */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('schools.selectUser')}
          </label>
          <Input
            placeholder={t('schools.searchUsers')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedUserId('');
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
          {/* User dropdown list */}
          {searchTerm && !selectedUserId && (
            <div className="mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-soft-lg">
              {isLoadingUsers ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="px-4 py-3 text-sm text-text-muted">{t('schools.noUsersFound')}</p>
              ) : (
                filteredUsers.slice(0, 10).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSearchTerm(`${user.firstName} ${user.lastName}`);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-hover text-start"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          {/* Selected user chip */}
          {selectedUser && (
            <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2.5 dark:border-primary-500/30 dark:bg-primary-500/10">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-200 text-xs font-medium text-primary-700 dark:bg-primary-500/30 dark:text-primary-300">
                {selectedUser.firstName[0]}{selectedUser.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {selectedUser.firstName} {selectedUser.lastName}
                </span>
                <span className="mx-1.5 text-xs text-primary-400">·</span>
                <span className="text-xs text-primary-500">{selectedUser.email}</span>
              </div>
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="rounded border-border accent-primary-600"
          />
          {t('schools.primaryAdmin')}
        </label>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} isLoading={isPending} disabled={!selectedUserId}>
          {t('schools.assignAdmin')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
