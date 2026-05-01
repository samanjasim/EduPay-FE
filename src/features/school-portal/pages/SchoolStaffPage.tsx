import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Trash2, Shield } from 'lucide-react';
import { Card, Badge, Button, Spinner } from '@/components/ui';
import { ConfirmModal } from '@/components/common';
import { useSchoolContext } from '../hooks/useSchoolContext';
import { useSchoolStaff, useRemoveStaff } from '../api/school-portal.queries';
import { InviteStaffModal } from '../components/staff/InviteStaffModal';
import type { SchoolStaffDto } from '@/types/school-portal.types';

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'default'> = {
  Active: 'success', Pending: 'warning',
};

export default function SchoolStaffPage() {
  const { t } = useTranslation();
  const { schoolId } = useSchoolContext();
  const { data: staff, isLoading } = useSchoolStaff(schoolId ?? undefined);
  const removeStaff = useRemoveStaff(schoolId ?? undefined);

  const [showInvite, setShowInvite] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<SchoolStaffDto | null>(null);
  const roleLabels: Record<string, string> = {
    CashCollector: t('schoolPortal.staff.roleCashCollector'),
    SchoolAdmin: t('schoolPortal.staff.roleSchoolAdmin'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('schoolPortal.staff.title')}</h1>
          <p className="mt-1 text-text-muted">{t('schoolPortal.staff.subtitle')}</p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t('schoolPortal.staff.invite')}
        </Button>
      </div>

      {/* Staff list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : !staff || staff.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-text-muted">
            {t('schoolPortal.staff.noStaff')}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="px-4 py-3 text-start font-medium">{t('schoolPortal.staff.name')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('schoolPortal.staff.email')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('schoolPortal.staff.roles')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('schoolPortal.staff.joined')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.userId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{member.fullName}</span>
                        {member.isPrimary && (
                          <Badge variant="warning" className="text-xs">
                            <Shield className="h-3 w-3 ltr:mr-0.5 rtl:ml-0.5" />
                            {t('schoolPortal.staff.primary')}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{member.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {member.roles.map((role) => (
                          <Badge key={role} variant="default" className="text-xs">{roleLabels[role] ?? role}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[member.status] ?? 'default'}>{member.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(member.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {!member.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t('common.remove')}
                          onClick={() => setStaffToRemove(member)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <InviteStaffModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        schoolId={schoolId ?? ''}
      />

      <ConfirmModal
        isOpen={!!staffToRemove}
        onClose={() => setStaffToRemove(null)}
        onConfirm={() => {
          if (staffToRemove) {
            removeStaff.mutate(staffToRemove.userId, {
              onSuccess: () => setStaffToRemove(null),
            });
          }
        }}
        title={t('schoolPortal.staff.removeTitle')}
        description={t('schoolPortal.staff.removeDesc', { name: staffToRemove?.fullName })}
        confirmLabel={t('common.remove')}
        isLoading={removeStaff.isPending}
      />
    </div>
  );
}
