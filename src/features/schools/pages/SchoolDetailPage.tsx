import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, School, Settings, Users, Trash2, UserPlus } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Spinner, Select, Modal, ModalFooter, Input,
} from '@/components/ui';
import {
  useSchool,
  useUpdateSchoolStatus,
  useDeleteSchool,
  useAssignSchoolAdmin,
  useRemoveSchoolAdmin,
} from '../api';
import { useUserRole } from '@/hooks';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import type { SchoolStatus } from '@/types';

const STATUS_CHANGE_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Deactivated', label: 'Deactivated' },
];

const statusBadgeVariant = (status: SchoolStatus) => {
  const map: Record<SchoolStatus, 'warning' | 'success' | 'error' | 'default'> = {
    Pending: 'warning',
    Active: 'success',
    Suspended: 'error',
    Deactivated: 'default',
  };
  return map[status];
};

export default function SchoolDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin, isSchoolAdmin, isPlatformAdmin } = useUserRole();
  const { data: school, isLoading } = useSchool(id!);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateSchoolStatus();
  const { mutate: deleteSchool, isPending: isDeleting } = useDeleteSchool();
  const { mutate: removeAdmin } = useRemoveSchoolAdmin();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

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

  const handleRemoveAdmin = (userId: string) => {
    removeAdmin({ schoolId: id!, userId });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to={ROUTES.SCHOOLS.LIST}>
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
          {t('schools.backToSchools')}
        </Button>
      </Link>

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
              <Badge variant={statusBadgeVariant(school.status)}>{school.status}</Badge>
              {isSuperAdmin && (
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-text-muted">{t('schools.city')}</label>
              <p className="text-text-primary">{school.city}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('schools.contactEmail')}</label>
              <p className="text-text-primary">{school.contactEmail || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('schools.phone')}</label>
              <p className="text-text-primary">{school.phone || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('schools.subscriptionPlan')}</label>
              <div className="mt-0.5">
                <Badge variant="primary" size="sm">{school.subscriptionPlan}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('schools.address')}</label>
              <p className="text-text-primary">{school.address || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('schools.academicYear')}</label>
              <p className="text-text-primary">{school.currentAcademicYear.label}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('common.createdAt')}</label>
              <p className="text-text-primary">
                {format(new Date(school.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Status change — SuperAdmin/Admin only */}
          {isPlatformAdmin && (
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <label className="text-sm font-medium text-text-muted">{t('schools.changeStatus')}:</label>
              <Select
                options={STATUS_CHANGE_OPTIONS}
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
      {(isSuperAdmin || isSchoolAdmin) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('schools.settings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-text-muted">{t('schools.currency')}</label>
                <p className="text-text-primary">{school.settings.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">{t('schools.timezone')}</label>
                <p className="text-text-primary">{school.settings.timezone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">{t('schools.defaultLanguage')}</label>
                <p className="text-text-primary">{school.settings.defaultLanguage}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">{t('schools.allowPartialPayments')}</label>
                <div className="mt-0.5">
                  <Badge variant={school.settings.allowPartialPayments ? 'success' : 'default'} size="sm">
                    {school.settings.allowPartialPayments ? t('common.yes') : t('common.no')}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">{t('schools.allowInstallments')}</label>
                <div className="mt-0.5">
                  <Badge variant={school.settings.allowInstallments ? 'success' : 'default'} size="sm">
                    {school.settings.allowInstallments ? t('common.yes') : t('common.no')}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">{t('schools.maxInstallments')}</label>
                <p className="text-text-primary">{school.settings.maxInstallments}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">{t('schools.lateFeePercentage')}</label>
                <p className="text-text-primary">{school.settings.lateFeePercentage}%</p>
              </div>
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
          {isPlatformAdmin && (
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-start font-medium text-text-secondary">{t('schools.adminName')}</th>
                    <th className="pb-3 text-start font-medium text-text-secondary">{t('schools.adminEmail')}</th>
                    <th className="pb-3 text-start font-medium text-text-secondary">{t('schools.adminRole')}</th>
                    <th className="pb-3 text-start font-medium text-text-secondary">{t('schools.adminAssigned')}</th>
                    {isPlatformAdmin && (
                      <th className="pb-3 text-end font-medium text-text-secondary">{t('common.actions')}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {school.admins.map((admin) => (
                    <tr key={admin.userId} className="hover:bg-hover transition-colors">
                      <td className="py-3 font-medium text-text-primary">{admin.fullName}</td>
                      <td className="py-3 text-text-secondary">{admin.email}</td>
                      <td className="py-3">
                        <Badge variant={admin.isPrimary ? 'primary' : 'outline'} size="sm">
                          {admin.isPrimary ? t('schools.primaryAdmin') : t('schools.admin')}
                        </Badge>
                      </td>
                      <td className="py-3 text-text-muted">
                        {format(new Date(admin.assignedAt), 'MMM d, yyyy')}
                      </td>
                      {isPlatformAdmin && (
                        <td className="py-3 text-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin.userId)}
                            className="text-red-500 hover:text-red-700"
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
        <p className="text-text-secondary">{t('schools.deleteConfirmation')}</p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            {t('common.delete')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        schoolId={id!}
      />
    </div>
  );
}

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
  const [userId, setUserId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const { mutate: assignAdmin, isPending } = useAssignSchoolAdmin();

  const handleSubmit = () => {
    if (!userId.trim()) return;
    assignAdmin(
      { schoolId, data: { userId, isPrimary } },
      {
        onSuccess: () => {
          setUserId('');
          setIsPrimary(false);
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('schools.assignAdmin')} size="sm">
      <div className="space-y-4">
        <Input
          label={t('schools.userId')}
          placeholder={t('schools.userIdPlaceholder')}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="rounded border-border"
          />
          {t('schools.primaryAdmin')}
        </label>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} isLoading={isPending}>{t('schools.assignAdmin')}</Button>
      </ModalFooter>
    </Modal>
  );
}
